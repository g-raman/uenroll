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

const getScheduleQueueHash = (
  schedule: ScheduleComponent[],
  nextIndex: number,
) => {
  return `[${nextIndex}]`.concat(
    schedule
      .flatMap(component => `${component.courseCode}:${component.subSection}`)
      .join(","),
  );
};

// TODO: Handle case where alternate section exists
// Example: 2 labs for the same course at the same time
export const generateSchedules = (components: ScheduleComponent[]) => {
  const validSchedules: Record<string, ScheduleComponent[]> = {};
  const numComponents = components.length;

  const seen = new Set();

  const queue: ScheduleQueueItem[] = [
    { nextComponentIndex: 0, selectedComponents: [] },
  ];

  while (queue.length !== 0) {
    const item = queue.shift();
    if (!item) {
      return [];
    }
    const { nextComponentIndex, selectedComponents } = item;

    if (nextComponentIndex === numComponents) {
      // Ensure only unique schedules are added
      const scheduleHash = getScheduleHash(selectedComponents);
      if (validSchedules[scheduleHash]) continue;
      validSchedules[scheduleHash] = selectedComponents;
    }

    const currentComponent = components[
      nextComponentIndex
    ] as ScheduleComponent;
    if (!currentComponent) continue;

    const { hasTimeConflicts, sectionConflict, typeConflict } = getConflicts(
      selectedComponents,
      currentComponent,
    );

    if (hasTimeConflicts) {
      const scheduleHash = getScheduleQueueHash(
        selectedComponents,
        nextComponentIndex + 1,
      );
      if (seen.has(scheduleHash)) continue;
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });
      seen.add(scheduleHash);
      continue;
    }

    if (sectionConflict) {
      /* Split into two branches
       * 1: Keep old section and move onto the next course
       * 2: Remove old section and replace with current section
       * */

      // Branch 1
      const nextCourseIndex = selectedComponents
        .slice(nextComponentIndex, -1)
        .findIndex(
          selected => selected.courseCode !== sectionConflict.courseCode,
        );

      /* It is possible that there are no more courses after the current one
       * in which case we set the newIndex to be the length of the array as this
       * will end the loop in the next iteration, and add the schedule to valid schedules
       * */
      const newComponentIndex =
        nextCourseIndex === -1 ? numComponents : nextCourseIndex;

      const scheduleHashBranch1 = getScheduleQueueHash(
        selectedComponents,
        newComponentIndex,
      );

      if (seen.has(scheduleHashBranch1)) continue;
      queue.push({
        nextComponentIndex: newComponentIndex,
        selectedComponents,
      });
      seen.add(scheduleHashBranch1);

      // Branch 2:
      const newSelectedComponents = [
        ...selectedComponents.filter(
          selected =>
            !(
              selected.courseCode === sectionConflict.courseCode &&
              selected.section === sectionConflict.section
            ),
        ),
        currentComponent,
      ];
      const scheduleHashBranch2 = getScheduleQueueHash(
        newSelectedComponents,
        nextComponentIndex + 1,
      );

      if (seen.has(scheduleHashBranch2)) continue;
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents: newSelectedComponents,
      });
      seen.add(scheduleHashBranch2);
      continue;
    }

    if (typeConflict) {
      /* Split into two branches
       * 1: Keep old component and move onto next component
       * 2: Remove old component and replace with current component
       * */

      // Branch 1
      const scheduleHashBranch1 = getScheduleQueueHash(
        selectedComponents,
        nextComponentIndex + 1,
      );

      if (seen.has(scheduleHashBranch1)) continue;
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });
      seen.add(scheduleHashBranch1);

      // Branch 2
      const toReplace = selectedComponents.findIndex(
        selected =>
          selected.courseCode === typeConflict.courseCode &&
          selected.type === typeConflict.type,
      );

      const newSelectedComponents = [...selectedComponents];
      newSelectedComponents[toReplace] = currentComponent;

      const scheduleHashBranch2 = getScheduleQueueHash(
        newSelectedComponents,
        nextComponentIndex + 1,
      );

      if (seen.has(scheduleHashBranch2)) continue;
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents: newSelectedComponents,
      });
      seen.add(scheduleHashBranch2);
      continue;
    }

    // Default case: No Conflicts
    const newSelectedComponents = [...selectedComponents, currentComponent];
    const scheduleHash = getScheduleQueueHash(
      newSelectedComponents,
      nextComponentIndex + 1,
    );

    if (seen.has(scheduleHash)) continue;
    queue.push({
      nextComponentIndex: nextComponentIndex + 1,
      selectedComponents: newSelectedComponents,
    });
    seen.add(scheduleHash);
  }
  const values = Object.values(validSchedules);
  return values.length === 0 ? [] : values;
};

const getConflicts = (
  selected: ScheduleComponent[],
  toAdd: ScheduleComponent,
) => {
  let hasTimeConflicts = false;
  let sectionConflict: ScheduleComponent | undefined;
  let typeConflict: ScheduleComponent | undefined;

  for (const component of selected) {
    // Rule 1: Cannot have time conflicts
    if (
      component.sessions.some(session =>
        toAdd.sessions.some(currSession =>
          isOverlappingTime(session, currSession),
        ),
      )
    ) {
      hasTimeConflicts = true;
    }

    // Rule 2: Cannot have components from two different sections
    // E.g. Lab from A and Tutorial from B
    if (
      component.courseCode === toAdd.courseCode &&
      component.section !== toAdd.section
    ) {
      sectionConflict = component;
    }

    // Rule 3: Cannot have two of the same types of components
    // E.g. Lab A01 and Lab A02
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

export const filterIncompleteSchedules = (
  courses: ColouredCourse[],
  schedules: ScheduleComponent[][],
) => {
  const filtered = schedules.filter(schedule =>
    courses.every(course =>
      schedule.some(component => component.courseCode === course.courseCode),
    ),
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
