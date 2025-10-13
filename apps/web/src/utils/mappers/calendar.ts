import { ColouredCourse, ScheduleItem, Selected } from "@/types/Types";
import { Section, Session } from "@repo/db/types";
import { RRule } from "rrule";
import { getOffsettedStartDateTime, getZonedDateTime } from "@/utils/datetime";
import { isSelected } from "@/utils/course";

type EventCreationFunction<T> = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => T;

export const createCalendarEvents = <T>(
  courses: ColouredCourse[],
  selected: Selected | null,
  mappingFunction: EventCreationFunction<T>,
): T[] => {
  if (selected === null) return [];

  return courses.flatMap(course =>
    Object.values(course.sections).flatMap(section =>
      section
        .filter(subSection => isSelected(subSection, course, selected))
        .flatMap(subSection =>
          subSection.sessions
            .filter(session => session.dayOfWeek !== "N/A")
            .map(session => mappingFunction(session, subSection, course)),
        ),
    ),
  );
};

export const coursesToCalendarAppEvents = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  return createCalendarEvents(courses, selected, courseToCalendarAppEvent);
};

const courseToCalendarAppEvent = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => {
  const zonedStartDateTime = getOffsettedStartDateTime(
    session.startDate,
    session.startTime,
    session.dayOfWeek,
  );
  const zonedEndDateTime = getZonedDateTime(
    zonedStartDateTime.toPlainDate().toString(),
    session.endTime,
  );

  const recurrenceEndDateTime = getZonedDateTime(
    session.endDate,
    session.endTime,
  );

  const rrule = new RRule({
    freq: RRule.WEEKLY,
    until: new Date(recurrenceEndDateTime.epochMilliseconds),
  });

  return {
    id: `${course.courseCode}${component.subSection}-${session.dayOfWeek}-${session.startTime.replaceAll(":", "")}`,
    title: `${course.courseCode}`,
    start: zonedStartDateTime,
    end: zonedEndDateTime,
    rrule: rrule.toString(),
    backgroundColour: course.colour,
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    term: course.term,
    subSection: component.subSection,
    instructor: session.instructor,
    type: component.type,
    isOpen: component.isOpen,
  };
};

export const scheduleToCalendarAppEvents = (schedule: ScheduleItem[]) =>
  schedule.flatMap(component =>
    component.sessions.flatMap(session => {
      const zonedStartDateTime = getOffsettedStartDateTime(
        session.startDate,
        session.startTime,
        session.dayOfWeek,
      );
      const zonedEndDateTime = getZonedDateTime(
        zonedStartDateTime.toPlainDate().toString(),
        session.endTime,
      );

      const recurrenceEndDateTime = getZonedDateTime(
        session.endDate,
        session.endTime,
      );

      const rrule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: new Date(zonedStartDateTime.epochMilliseconds),
        until: new Date(recurrenceEndDateTime.epochMilliseconds),
      });

      return {
        id: `${component.courseCode}${component.subSection}-${session.dayOfWeek}-${session.startTime.replaceAll(":", "")}`,
        title: `${component.courseCode}`,
        start: zonedStartDateTime,
        end: zonedEndDateTime,
        rrule: rrule.toString(),
        backgroundColour: component.colour,
        courseCode: component.courseCode,
        courseTitle: component.courseTitle,
        term: component.term,
        subSection: component.subSection,
        instructor: session.instructor,
        type: component.type,
        isOpen: component.isOpen,
      };
    }),
  );
