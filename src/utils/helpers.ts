import { Component, Course, Session } from "@/types/Types";
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
