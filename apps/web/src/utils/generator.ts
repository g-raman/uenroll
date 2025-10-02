import { ColouredCourse } from "@/types/Types";
import { isOverlappingTime } from "./calendarEvents";
import { ScheduleComponent } from "./courseData";

interface ScheduleQueueItem {
  nextComponentIndex: number;
  selectedComponents: ScheduleComponent[];
}

const getScheduleHash = (schedule: ScheduleComponent[]) => {
  return schedule
    .flatMap(component => `${component.courseCode}:${component.subSection}`)
    .join(",");
};

const getQueueHash = (schedule: ScheduleComponent[], nextIndex: number) => {
  return `[${nextIndex}]`.concat(
    schedule
      .flatMap(component => `${component.courseCode}:${component.subSection}`)
      .join(","),
  );
};

// TODO: Handle case where alternate section exists
// Example: 2 labs for the same course at the same time
//
//
// Potential solution: Pre process and mark alternatives and remove duplicates
export const generateSchedules = (components: ScheduleComponent[]) => {
  const validSchedules: Record<string, ScheduleComponent[]> = {};
  const numComponents = components.length;

  const seen = new Set<string>();

  const queue: ScheduleQueueItem[] = [
    { nextComponentIndex: 0, selectedComponents: [] },
  ];

  while (queue.length !== 0) {
    const item = queue.shift();
    if (!item) return Object.values(validSchedules);

    const { nextComponentIndex, selectedComponents: selected } = item;

    // Ensure only unique schedules are added
    if (nextComponentIndex === numComponents) {
      const scheduleHash = getScheduleHash(selected);
      if (validSchedules[scheduleHash]) continue;
      validSchedules[scheduleHash] = selected;
    }

    const currentComponent = components[nextComponentIndex];
    if (!currentComponent) continue;

    const { hasTimeConflicts, sectionConflict, typeConflict } = getConflicts(
      selected,
      currentComponent,
    );

    // Rule 1: Cannot have time conflicts
    if (hasTimeConflicts) {
      enqueueIfNew(queue, seen, selected, nextComponentIndex + 1);
      continue;
    }

    /* Rule 2: Cannot have components from two different sections
     * E.g. Lab from A and Tutorial from B
     *
     * Split into two branches
     * 1: Keep old section and move onto the next course
     * 2: Remove old section and replace with current section
     * */
    if (sectionConflict) {
      handleSectionConflict(
        queue,
        seen,
        selected,
        currentComponent,
        sectionConflict,
        nextComponentIndex,
      );
      continue;
    }

    /*
     * Rule 3: Cannot have two of the same types of components
     * E.g. Lab A01 and Lab A02
     *
     * Split into two branches
     * 1: Keep old component and move onto next component
     * 2: Remove old component and replace with current component
     * */
    if (typeConflict) {
      handleTypeConflict(
        queue,
        seen,
        selected,
        currentComponent,
        typeConflict,
        nextComponentIndex,
      );
      continue;
    }

    // Default case: No Conflicts
    enqueueIfNew(
      queue,
      seen,
      [...selected, currentComponent],
      nextComponentIndex + 1,
    );
  }

  return Object.values(validSchedules);
};

const getConflicts = (
  selected: ScheduleComponent[],
  toAdd: ScheduleComponent,
) => {
  let hasTimeConflicts = false;
  let sectionConflict: ScheduleComponent | undefined;
  let typeConflict: ScheduleComponent | undefined;

  for (const component of selected) {
    if (
      component.sessions.some(session =>
        toAdd.sessions.some(currSession =>
          isOverlappingTime(session, currSession),
        ),
      )
    ) {
      hasTimeConflicts = true;
    }

    if (
      component.courseCode === toAdd.courseCode &&
      component.section !== toAdd.section
    ) {
      sectionConflict = component;
    }

    if (
      component.type === toAdd.type &&
      component.courseCode === toAdd.courseCode
    ) {
      typeConflict = component;
    }

    if (hasTimeConflicts && sectionConflict && typeConflict) break;
  }

  return { hasTimeConflicts, sectionConflict, typeConflict };
};

const enqueueIfNew = (
  queue: ScheduleQueueItem[],
  seen: Set<string>,
  selected: ScheduleComponent[],
  idx: number,
) => {
  const hash = getQueueHash(selected, idx);
  if (seen.has(hash)) return;

  queue.push({ nextComponentIndex: idx, selectedComponents: selected });
  seen.add(hash);
};

const handleSectionConflict = (
  queue: ScheduleQueueItem[],
  seen: Set<string>,
  selected: ScheduleComponent[],
  current: ScheduleComponent,
  conflict: ScheduleComponent,
  idx: number,
) => {
  // Branch 1: Keep old section, skip to next course
  enqueueIfNew(queue, seen, selected, idx + 1);

  // Branch 2: Replace old section with current
  const newSelected = [
    ...selected.filter(
      selectedComponent =>
        !(
          selectedComponent.courseCode === conflict.courseCode &&
          selectedComponent.section === conflict.section
        ),
    ),
    current,
  ];
  enqueueIfNew(queue, seen, newSelected, idx + 1);
};

const handleTypeConflict = (
  queue: ScheduleQueueItem[],
  seen: Set<string>,
  selected: ScheduleComponent[],
  current: ScheduleComponent,
  conflict: ScheduleComponent,
  idx: number,
) => {
  // Branch 1: Keep old component
  enqueueIfNew(queue, seen, selected, idx + 1);

  // Branch 2: Replace with current component
  const replaceIdx = selected.findIndex(
    selectedComponent =>
      selectedComponent.courseCode === conflict.courseCode &&
      selectedComponent.type === conflict.type,
  );
  const newSelected = [...selected];
  newSelected[replaceIdx] = current;
  enqueueIfNew(queue, seen, newSelected, idx + 1);
};

export const filterIncompleteSchedules = (
  courses: ColouredCourse[],
  schedules: ScheduleComponent[][],
) => {
  const filtered = schedules.filter(schedule =>
    courses.every(course => {
      const requiredTypes = new Set(
        Object.values(course.sections).flatMap(sections =>
          sections.map(component => component.type),
        ),
      );

      return Array.from(requiredTypes).every(type =>
        schedule.some(
          comp => comp.courseCode === course.courseCode && comp.type === type,
        ),
      );
    }),
  );
  return filtered;
};

export const logValidSchedules = (
  schedules: Record<string, ScheduleComponent[]>,
) => {
  const result = Object.values(schedules).map(schedule =>
    schedule.map(
      component =>
        `${component.courseCode} ${component.subSection} ${component.type}`,
    ),
  );
  console.log(JSON.stringify(result, null, 2));
};

export const logQueue = (queue: ScheduleQueueItem[]) => {
  const result = queue.map(item =>
    item.selectedComponents.flatMap(
      selectedComponent =>
        `${selectedComponent.courseCode} ${selectedComponent.subSection} ${selectedComponent.type}`,
    ),
  );
  console.log(result);
};
