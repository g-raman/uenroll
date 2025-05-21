import {
  Component,
  Course,
  Selected,
  SelectedSession,
  Session,
} from "@/types/Types";
import { dayOfWeekToNumberMap } from "./constants";

export const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createSession = (
  session: Session,
  component: Component,
  course: Course,
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
    subSection: component.subSection,
    instructor: session.instructor,
    type: component.type,
    isOpen: component.isOpen,
  },
});

const isSelected = (
  component: Component,
  course: Course,
  selected: Selected,
) => {
  if (!selected) return false;
  if (!selected[course.courseCode]) return false;

  return selected[course.courseCode].some(
    (section: string) => component.subSection === section,
  );
};

export const createNewSelectedSessions = (
  courses: Course[],
  selected: Selected | null,
): SelectedSession[] => {
  if (selected === null) return [];

  return courses.flatMap(course =>
    course.sections.flatMap(section =>
      section.components.flatMap(component =>
        component.sessions
          .filter(() => isSelected(component, course, selected))
          .map(session => createSession(session, component, course)),
      ),
    ),
  );
};
