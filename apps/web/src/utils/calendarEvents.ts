import { ColouredCourse, Selected } from "@/types/Types";
import { dayOfWeekToNumberMap, TIMEZONE } from "./constants";
import { Session, Section } from "@repo/db/types";
import dayjs from "dayjs";
import { datetime, RRule } from "rrule";
import { IcsEvent } from "ts-ics";
import { v4 } from "uuid";

type EventCreationFunction<T> = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => T;

const getOffsettedStartDate = (startDate: string, dayOfWeek: string) => {
  const baseStartDate = dayjs(startDate);
  const dayOfWeekNum = dayOfWeekToNumberMap[dayOfWeek] as number;
  const dayOffset = dayOfWeekNum - baseStartDate.get("d");

  return baseStartDate.add(dayOffset < 0 ? 7 + dayOffset : dayOffset, "days");
};

export const getPlainStringTime = (zonedDateTime: Temporal.ZonedDateTime) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(zonedDateTime.epochMilliseconds));
};

const DATE_FORMAT = "YYYY-MM-DD";
const createCalendarEvent = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => {
  const startDate = getOffsettedStartDate(session.startDate, session.dayOfWeek);
  const endDate = dayjs(session.endDate);

  const rrule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: datetime(
      startDate.get("year"),
      startDate.get("month") + 1,
      startDate.get("day"),
    ),
    until: datetime(
      endDate.get("year"),
      endDate.get("month") + 1,
      endDate.get("day"),
    ),
  });
  const startTime = session.startTime.slice(0, -3);
  const endTime = session.endTime.slice(0, -3);

  return {
    id: `${course.courseCode}${component.subSection}`,
    title: `${course.courseCode}`,
    start: `${startDate.format(DATE_FORMAT)} ${startTime}`,
    end: `${startDate.format(DATE_FORMAT)} ${endTime}`,
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
  const startDate = getOffsettedStartDate(
    session.startDate,
    session.dayOfWeek,
  ).format(DATE_FORMAT);

  const parsedStartTime = session.startTime.slice(0, -3);
  const parsedEndTime = session.endTime.slice(0, -3);

  const startTime = dayjs(`${startDate} ${parsedStartTime}`);
  const endTime = dayjs(`${startDate} ${parsedEndTime}`);

  const recurrenceUntil = dayjs(`${session.endDate} ${parsedEndTime}`);

  const event: IcsEvent = {
    uid: v4(),
    stamp: { date: new Date() },
    start: { date: startTime.toDate() },
    end: { date: endTime.toDate() },
    recurrenceRule: {
      frequency: "WEEKLY",
      until: { date: recurrenceUntil.toDate() },
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
