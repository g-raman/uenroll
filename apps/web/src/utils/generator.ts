import {
  CourseWithSectionAlternatives,
  ScheduleItem,
  SectionWithAlternatives,
} from "@/types/Types";
import { isOverlappingTime } from "@/utils/datetime";

/*
 * This method uses a DFS approach to generate all possible schedules
 * */
export const generateSchedule = (courses: CourseWithSectionAlternatives[]) => {
  const courseCombinations = courses.map(course =>
    getSubSectionCombinationsByType(course),
  );
  const selected: ScheduleItem[] = [];
  const results: ScheduleItem[][] = [];

  const backtrack = (index: number) => {
    if (index === courseCombinations.length) {
      results.push([...selected]);
      return;
    }

    for (const combination of courseCombinations[index] as ScheduleItem[][]) {
      if (hasConflict(selected, combination)) continue;

      selected.push(...combination);
      backtrack(index + 1);
      selected.splice(selected.length - combination.length);
    }
  };
  backtrack(0);
  return results;
};

/*
 * This method generates all valid combinations where each type of
 * sub section is selected once.
 *
 * E.g. one LEC, one LAB, one DGD, etc.
 * */
const getSubSectionCombinationsByType = (
  course: CourseWithSectionAlternatives,
) => {
  const groupedByType: Record<string, SectionWithAlternatives[]> = {};

  for (const section of Object.values(course.sections)) {
    for (const item of section) {
      if (!groupedByType[item.type]) groupedByType[item.type] = [];
      groupedByType[item.type]?.push(item);
    }
  }

  const requiredTypes = Object.keys(groupedByType);
  const combinations: ScheduleItem[][] = [];

  const backtrack = (index: number, chosen: ScheduleItem[]) => {
    if (index === requiredTypes.length) {
      combinations.push([...chosen]);
      return;
    }

    const type = requiredTypes[index] as string;

    for (const subSection of groupedByType[type] as SectionWithAlternatives[]) {
      const currentSection = chosen[0] ? chosen[0].section : subSection.section;

      if (subSection.section !== currentSection) continue;
      backtrack(index + 1, [
        ...chosen,
        {
          ...subSection,
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          colour: course.colour,
          term: course.term,
        },
      ]);
    }
  };

  backtrack(0, []);
  return combinations;
};

/*
 * This method checks if a given potential addition
 * to the schedule, any time conflicts are created.
 * */
const hasConflict = (
  selected: ScheduleItem[],
  newOption: ScheduleItem[],
): boolean => {
  for (const section of newOption) {
    for (const chosen of selected) {
      if (chosen.courseCode === section.courseCode) continue;

      const hasConflict = chosen.sessions.some(chosen =>
        section.sessions.some(session => isOverlappingTime(chosen, session)),
      );

      if (hasConflict) return true;
    }
  }
  return false;
};
