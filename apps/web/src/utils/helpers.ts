import { ColouredCourse, Selected } from "@/types/Types";
import { dayOfWeekToNumberMap } from "./constants";
import { Session, Section } from "@repo/db/types";

export const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j] as string, array[i] as string];
  }
  return array;
};

export const createSession = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => ({
  startTime: session.startTime.slice(0, -3),
  endTime: session.endTime.slice(0, -3),
  startRecur: session.startDate,
  endRecur: session.endDate,
  dayOfWeek: dayOfWeekToNumberMap[session.dayOfWeek] as number,
  courseDetails: {
    backgroundColour: course.colour as string,
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    term: course.term,
    subSection: component.subSection as string,
    instructor: session.instructor,
    type: component.type,
    isOpen: component.isOpen,
  },
});

const isSelected = (
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

export const createNewSelectedSessions = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  if (selected === null) return [];

  return courses.flatMap(course =>
    Object.values(course.sections).flatMap(section =>
      section
        .filter(subSection => isSelected(subSection, course, selected))
        .flatMap(subSection =>
          subSection.sessions.map(session =>
            createSession(session, subSection, course),
          ),
        ),
    ),
  );
};
