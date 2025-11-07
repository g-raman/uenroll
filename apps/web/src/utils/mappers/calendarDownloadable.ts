import { ColouredCourse, Selected } from "@/types/Types";
import { createCalendarEvents } from "@/utils/mappers/calendar";
import { Section, Session } from "@repo/db/types";
import { getOffsettedStartDateTime, getZonedDateTime } from "@/utils/datetime";
import { IcsEvent } from "ts-ics";

export const coursesToDownloadableCalendarEvents = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  return createCalendarEvents(
    courses,
    selected,
    courseToDownloadableCalendarEvent,
  );
};

export const courseToDownloadableCalendarEvent = (
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
