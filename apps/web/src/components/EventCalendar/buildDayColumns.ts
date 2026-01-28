import { Temporal } from "temporal-polyfill";
import { CalendarEvent, DayColumn } from "./types";
import { DAYS_OF_WEEK } from "./constants";
import { getToday, isSameDay } from "./dateUtils";
import { layoutOverlappingEvents } from "./eventLayout";
import { expandRecurringEvents } from "./rrule";

function getEventsForDay(
  events: CalendarEvent[],
  date: Temporal.PlainDate,
): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = event.start.toPlainDate();
    return isSameDay(eventDate, date);
  });
}

export function buildDayColumns(
  events: CalendarEvent[],
  startDate: Temporal.PlainDate,
  timezone: string,
  dayStartHour: number,
  dayEndHour: number,
  hideWeekends: boolean = false,
  numDays: number = 7,
): DayColumn[] {
  const today = getToday(timezone);

  const days = Array.from({ length: numDays }, (_, i) =>
    startDate.add({ days: i }),
  ).filter(
    day =>
      (!hideWeekends && day.dayOfWeek <= 7) ||
      (hideWeekends && day.dayOfWeek <= 5),
  );

  const rangeStart = days[0] as Temporal.PlainDate;
  const rangeEnd = days[days.length - 1] as Temporal.PlainDate;

  const expandedEvents = expandRecurringEvents(
    events,
    rangeStart,
    rangeEnd,
    timezone,
  );

  return days.map(date => {
    const dayEvents = getEventsForDay(expandedEvents, date);
    const positionedEvents = layoutOverlappingEvents(
      dayEvents,
      dayStartHour,
      dayEndHour,
    );

    return {
      date,
      dayOfWeek: DAYS_OF_WEEK[date.dayOfWeek]!,
      dayNumber: date.day,
      isToday: isSameDay(date, today),
      events: positionedEvents,
    };
  });
}
