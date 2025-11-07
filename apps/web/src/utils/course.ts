import {
  ColouredCourse,
  CourseWithSectionAlternatives,
  Selected,
} from "@/types/Types";
import { Section } from "@repo/db/types";

export const isSelected = (
  subSection: Section,
  course: ColouredCourse,
  selected: Selected,
) => {
  if (!selected) return false;
  if (!selected[course.courseCode]) return false;

  return selected[course.courseCode]?.some(
    (section: string) => subSection.subSection === section,
  );
};

export const isAlternativeSubSection = (first: Section, second: Section) => {
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

export const sortCoursesByNumSubSections = (
  courses: CourseWithSectionAlternatives[],
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

export const filterVirtualSessions = (course: ColouredCourse) => {
  const cleanedSections = Object.fromEntries(
    Object.entries(course.sections)
      .map(([key, sections]) => [
        key,
        sections
          .map(section => ({
            ...section,
            sessions: section.sessions.filter(
              session => session.dayOfWeek !== "N/A",
            ),
          }))
          // Only keep sub sections with sessions remaning
          .filter(section => section.sessions.length > 0),
      ])
      // Only keep sections with sub sections remaining
      .filter(([, sections]) => sections && sections.length > 0),
  );

  // If no sections remain, remove course
  if (Object.keys(cleanedSections).length === 0) {
    return null;
  }

  return {
    ...course,
    sections: cleanedSections,
  };
};

export const filterCoursesWithVirutalSessions = (courses: ColouredCourse[]) => {
  return courses
    .map(course => filterVirtualSessions(course))
    .filter(course => course != null);
};
