import { Temporal } from "temporal-polyfill";
import { ColouredCourse, Selected } from "@/types/Types";
import { dayOfWeekToNumberMap, TIMEZONE } from "./constants";
import { Session, Section } from "@repo/db/types";
import { RRule } from "rrule";
import { IcsEvent } from "ts-ics";
import { ScheduleComponent } from "./courseData";

type EventCreationFunction<T> = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => T;

export const getOffsettedStartDateTime = (
  date: string,
  time: string,
  dayOfWeek: string,
) => {
  const baseStartDate = getZonedDateTime(date, time);
  const target = dayOfWeekToNumberMap[dayOfWeek] as number;
  // Difference (could be negative if target < start day, so normalize with +7 % 7)
  const dayOffset = (target - baseStartDate.dayOfWeek + 7) % 7;

  return baseStartDate.add({ days: dayOffset });
};

export function isOverlappingTime(first: Session, second: Session) {
  const firstStart = getOffsettedStartDateTime(
    first.startDate,
    first.startTime,
    first.dayOfWeek,
  );

  const firstEnd = getOffsettedStartDateTime(
    first.startDate,
    first.endTime,
    first.dayOfWeek,
  );

  const secondStart = getOffsettedStartDateTime(
    second.startDate,
    second.startTime,
    second.dayOfWeek,
  );

  const secondEnd = getOffsettedStartDateTime(
    second.startDate,
    second.endTime,
    second.dayOfWeek,
  );

  // Standard overlap check
  return (
    Temporal.ZonedDateTime.compare(firstStart, secondEnd) < 0 &&
    Temporal.ZonedDateTime.compare(secondStart, firstEnd) < 0
  );
}

export const getPlainStringTime = (zonedDateTime: Temporal.ZonedDateTime) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: zonedDateTime.timeZoneId,
  }).format(new Date(zonedDateTime.epochMilliseconds));
};

export const getZonedDateTime = (date: string, time: string) => {
  return Temporal.ZonedDateTime.from(`${date}T${time}[${TIMEZONE}]`);
};

const createCalendarEvent = (
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
    dtstart: new Date(zonedStartDateTime.epochMilliseconds),
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

export const scheduleToCalendarEvents = (schedule: ScheduleComponent[]) => {
  return schedule.flatMap(component =>
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
};

export const createDownloadableCalendarEvent = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => {
  const startDateTime = getOffsettedStartDateTime(
    session.startDate,
    session.startTime,
    session.dayOfWeek,
  );
  const endDateTime = getZonedDateTime(
    startDateTime.toPlainDate().toString(),
    session.endTime,
  );

  const recurrenceEndDateTime = getZonedDateTime(
    session.endDate,
    session.endTime,
  );

  const event: IcsEvent = {
    uid: `${course.term}-${course.courseCode}-${component.subSection}-${session.dayOfWeek}-${session.startDate}-${session.startTime}`,
    stamp: { date: new Date() },
    start: { date: new Date(startDateTime.epochMilliseconds) },
    end: { date: new Date(endDateTime.epochMilliseconds) },
    recurrenceRule: {
      frequency: "WEEKLY",
      until: { date: new Date(recurrenceEndDateTime.epochMilliseconds) },
    },
    summary: `${course.courseCode} ${course.courseTitle} - ${component.type}`,
  };

  return event;
};

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

const createCalendarEvents = <T>(
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

export const createCalendarAppEvents = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  return createCalendarEvents(courses, selected, createCalendarEvent);
};

export const createDownloadableCalendarEvents = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  return createCalendarEvents(
    courses,
    selected,
    createDownloadableCalendarEvent,
  );
};
