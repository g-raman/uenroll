import { GroupedSearchResults, SectionWithAlternatives } from "./mappers";
import { isOverlappingTime } from "./calendarEvents";

export type Expand<T> = {
  [K in keyof T]: T[K];
};

export interface IScheduleItem extends SectionWithAlternatives {
  courseCode: string;
  courseTitle: string;
  colour: string;
  term: string;
}

export type ScheduleItem = Expand<IScheduleItem>;

export const getCombinationsByType = (course: GroupedSearchResults) => {
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

export const generateSched = (courses: GroupedSearchResults[]) => {
  const courseCombinations = courses.map(course =>
    getCombinationsByType(course),
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

const hasConflict = (
  selected: ScheduleItem[],
  newOption: ScheduleItem[],
): boolean => {
  for (const sec of newOption) {
    for (const chosen of selected) {
      if (chosen.courseCode === sec.courseCode) continue; // same course, ignore

      // Time conflict -> prune early
      if (
        chosen.sessions.some(c =>
          sec.sessions.some(s => isOverlappingTime(c, s)),
        )
      ) {
        return true;
      }
    }
  }
  return false;
};
