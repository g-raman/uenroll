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
    let componentWithSectionConflict = undefined;
    let componentWithTypeConflict = undefined;
    for (const component of selectedComponents) {
      // Rule 1: Cannot overlap in time
      hasTimeConflicts = component.sessions.some(session =>
        currentComponent.sessions.some(currSession =>
          isOverlappingTime(session, currSession),
        ),
      );

      // Rule 2: Cannot have components from different sections
      componentWithSectionConflict =
        component.courseCode === currentComponent.courseCode &&
        component.section !== currentComponent.section
          ? component
          : undefined;

      // Rule 3: Cannot have the same type of component twice from the same course
      componentWithTypeConflict =
        component.type === currentComponent.type &&
        component.courseCode === currentComponent.courseCode
          ? component
          : undefined;
    }

    if (hasTimeConflicts) {
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });
      continue;
    }

    if (componentWithSectionConflict) {
      /* Split into two branches
       * 1: Keep old section and move onto the next course
       * 2: Remove old section and replace with current section
       * */

      // Branch 1
      const nextCourseIndex = selectedComponents
        .slice(nextComponentIndex, -1)
        .findIndex(
          selected =>
            selected.courseCode !== componentWithSectionConflict.courseCode,
        );

      /* It is possible that there are no more courses after the current one
       * in which case we set the newIndex to be the length of the array as this
       * will end the loop in the next iteration, and add the schedule to valid schedules
       * */
      const newComponentIndex =
        nextCourseIndex === -1 ? numComponents : nextCourseIndex;

      queue.push({
        nextComponentIndex: newComponentIndex,
        selectedComponents,
      });

      // Branch 2:
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
      continue;
    }

    if (componentWithTypeConflict) {
      /* Split into two branches
       * 1: Keep old component and move onto next component
       * 2: Remove old component and replace with current component
       * */

      // Branch 1
      queue.push({
        nextComponentIndex: nextComponentIndex + 1,
        selectedComponents,
      });

      // Branch 2
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
      continue;
    }

    // Default case: No Conflicts
    queue.push({
      nextComponentIndex: nextComponentIndex + 1,
      selectedComponents: [...selectedComponents, currentComponent],
    });
  }
  logValidSchedules(validSchedules);
  console.log(JSON.stringify(Object.values(validSchedules).length, null, 2));
}

generateSchedules(courses);
