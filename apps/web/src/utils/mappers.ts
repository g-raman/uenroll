import { ColouredCourse } from "@/types/Types";
import { Section } from "@repo/db/types";

interface SectionWithAlternatives extends Section {
  alternatives: string[];
}

export const groupSubSectionAlternatives = (course: ColouredCourse) => {
  const newSections: Record<string, SectionWithAlternatives[]> = {};

  for (const [key, sectionList] of Object.entries(course.sections)) {
    const grouped: SectionWithAlternatives[] = [];
    // Temporary map to group by JSON stringified sessions
    const seen = new Set<string>();

    sectionList.forEach(subSection => {
      if (!subSection.subSection || seen.has(subSection.subSection)) return;

      const alternatives = sectionList
        .filter(toFilter => isAlternativeSubSection(subSection, toFilter))
        .map(alternative => alternative.subSection)
        .filter(alternative => alternative !== null);

      grouped.push({
        section: subSection.section,
        subSection: subSection.subSection,
        isOpen: subSection.isOpen,
        type: subSection.type,
        alternatives,
        sessions: subSection.sessions,
      });

      alternatives.forEach(alternative => seen.add(alternative));
    });

    newSections[key] = grouped;
  }

  return {
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    colour: course.colour,
    term: course.term,
    sections: newSections,
  };
};

export const sortCoursesByNumSubSections = (
  courses: GroupedSearchResults[],
) => {
  courses.sort(
    (a, b) =>
      Object.values(a.sections).reduce(
        (prev, curr) =>
          prev +
          curr.reduce((prev2, curr2) => prev2 + curr2.sessions.length, 0),
        0,
      ) -
      Object.values(b.sections).reduce(
        (prev, curr) =>
          prev +
          curr.reduce((prev2, curr2) => prev2 + curr2.sessions.length, 0),
        0,
      ),
  );
};

const isAlternativeSubSection = (first: Section, second: Section) => {
  if (
    first.sessions.length !== second.sessions.length ||
    first.type !== second.type ||
    first.subSection === second.subSection
  )
    return false;

  return first.sessions.every(fSession =>
    second.sessions.some(
      sSession =>
        fSession.startTime === sSession.startTime &&
        fSession.endTime === sSession.endTime &&
        fSession.startDate === sSession.startDate &&
        fSession.endDate === sSession.endDate &&
        fSession.dayOfWeek === sSession.dayOfWeek,
    ),
  );
};

export type GroupedSearchResults = ReturnType<
  typeof groupSubSectionAlternatives
>;
