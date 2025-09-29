import { Temporal } from "temporal-polyfill";
import { ColouredCourse, Selected } from "@/types/Types";
import { dayOfWeekToNumberMap, TIMEZONE } from "./constants";
import { Session, Section } from "@repo/db/types";
import { RRule } from "rrule";
import { IcsEvent } from "ts-ics";

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
  const firstDateStartTime = getOffsettedStartDateTime(
    first.startDate,
    first.startTime,
    first.dayOfWeek,
  );

  const firstDateEndTime = getOffsettedStartDateTime(
    first.startDate,
    first.endTime,
    first.dayOfWeek,
  );

  const secondDateStartTime = getOffsettedStartDateTime(
    second.startDate,
    second.startTime,
    second.dayOfWeek,
  );

  const secondDateEndTime = getOffsettedStartDateTime(
    second.startDate,
    second.endTime,
    second.dayOfWeek,
  );

  const range1Compare = Temporal.ZonedDateTime.compare(
    firstDateStartTime,
    secondDateEndTime,
  );
  const range1Overlaps = range1Compare === 0 || range1Compare < 0;

  const range2Compare = Temporal.ZonedDateTime.compare(
    firstDateEndTime,
    secondDateStartTime,
  );
  const range2Overlaps = range2Compare === 0 || range2Compare > 0;

  return range1Overlaps && range2Overlaps;
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
