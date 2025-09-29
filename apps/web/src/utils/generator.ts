import { courses, ScheduleComponent } from "./courseData";
import { isOverlappingTime } from "./dates";

interface ScheduleQueueItem {
  nextComponentIndex: number;
  selectedComponents: ScheduleComponent[];
}

const logValidSchedules = (schedules: Record<string, ScheduleComponent[]>) => {
  const result = Object.values(schedules).map(schedule =>
    schedule.map(
      component =>
        `${component.courseCode} ${component.subSection} ${component.type}`,
    ),
  );
  console.log(JSON.stringify(result, null, 2));
};

const getScheduleHash = (schedule: ScheduleComponent[]) => {
  return schedule
    .flatMap(component => `${component.courseCode}:${component.subSection}`)
    .join(",");
};

const logQueue = (queue: ScheduleQueueItem[]) => {
  const result = queue.map(item =>
    item.selectedComponents.flatMap(
      selectedComponent =>
        `${selectedComponent.courseCode} ${selectedComponent.subSection} ${selectedComponent.type}`,
    ),
  );
  console.log(result);
};

// TODO: Handle case where alternate section exists
// Example: 2 labs for the same course at the same time
function generateSchedules(components: ScheduleComponent[]) {
  const validSchedules: Record<string, ScheduleComponent[]> = {};
  const numComponents = components.length;

  const queue: ScheduleQueueItem[] = [
    { nextComponentIndex: 0, selectedComponents: [] },
  ];

  while (queue.length !== 0) {
    const item = queue.shift();
    if (!item) {
      return;
    }
    const { nextComponentIndex, selectedComponents } = item;

    if (nextComponentIndex === numComponents) {
      const scheduleHash = getScheduleHash(selectedComponents);
      if (validSchedules[scheduleHash]) continue;
      validSchedules[scheduleHash] = selectedComponents;
    }

    const currentComponent = components[
      nextComponentIndex
    ] as ScheduleComponent;
    if (!currentComponent) continue;

    let hasTimeConflicts = false;
    for (const component of selectedComponents) {
      hasTimeConflicts = component.sessions.some(session =>
        currentComponent.sessions.some(currSession =>
          // Rule 1: Cannot overlap in time
          isOverlappingTime(session, currSession),
        ),
      );
    }

    if (hasTimeConflicts) {
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });
      // logQueue(queue);
      continue;
    }

    // Rule 2: Cannot have components from different sections
    const componentWithSectionConflict = getComponentWithSectionConflict(
      selectedComponents,
      currentComponent,
    );

    if (componentWithSectionConflict) {
      const nextCourse = selectedComponents
        .slice(nextComponentIndex, -1)
        .findIndex(
          selected =>
            selected.courseCode !== componentWithSectionConflict.courseCode,
        );

      const newIndex = nextCourse === -1 ? numComponents : nextCourse;

      queue.push({
        nextComponentIndex: newIndex,
        selectedComponents,
      });

      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents: [
          ...selectedComponents.filter(
            selected =>
              !(
                selected.courseCode ===
                  componentWithSectionConflict.courseCode &&
                selected.section === componentWithSectionConflict.section
              ),
          ),
          currentComponent,
        ],
      });
      // logQueue(queue);
      continue;
    }

    // Rule 3: Cannot have the same type of component twice from the same course
    const componentWithTypeConflict = getComponentWithTypeConflict(
      selectedComponents,
      currentComponent,
    );

    if (componentWithTypeConflict) {
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });

      const toReplace = selectedComponents.findIndex(
        selected =>
          selected.courseCode === componentWithTypeConflict.courseCode &&
          selected.type === componentWithTypeConflict.type,
      );

      const newSelectedComponents = [...selectedComponents];
      newSelectedComponents[toReplace] = currentComponent;

      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents: newSelectedComponents,
      });
      // logQueue(queue);
      continue;
    }

    // Default case: No Conflicts
    queue.push({
      nextComponentIndex: nextComponentIndex + 1,
      selectedComponents: [...selectedComponents, currentComponent],
    });

    // logQueue(queue);
  }
  logValidSchedules(validSchedules);
  console.log(JSON.stringify(Object.values(validSchedules).length, null, 2));
}

const getComponentWithTypeConflict = (
  components: ScheduleComponent[],
  toCheck: ScheduleComponent,
) => {
  return components.find(
    component =>
      component.type === toCheck.type &&
      component.courseCode === toCheck.courseCode,
  );
};

const getComponentWithSectionConflict = (
  components: ScheduleComponent[],
  toCheck: ScheduleComponent,
) => {
  return components.find(
    component =>
      component.section !== toCheck.section &&
      component.courseCode === toCheck.courseCode,
  );
};

generateSchedules(courses);
