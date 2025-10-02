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
