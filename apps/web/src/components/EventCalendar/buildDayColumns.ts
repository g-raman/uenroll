import { Temporal } from "temporal-polyfill";
import { CalendarEvent, DayColumn } from "./types";
import { DAYS_OF_WEEK } from "./constants";
import { getToday, isSameDay } from "./dateUtils";
import { layoutOverlappingEvents } from "./eventLayout";
import { expandRecurringEvents } from "./rrule";

/**
 * Filter events for a specific day
 */
function getEventsForDay(
  events: CalendarEvent[],
  date: Temporal.PlainDate,
): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = event.start.toPlainDate();
    return isSameDay(eventDate, date);
  });
}

/**
 * Build day columns with positioned events
 * @param startDate - The date to start from (week start for desktop, current date for mobile)
 * @param numDays - Optional number of days to show (defaults to 7 or 5 if hideWeekends)
 */
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

  // Generate days starting from startDate
  const days = Array.from({ length: numDays }, (_, i) =>
    startDate.add({ days: i }),
  ).filter(
    day =>
      (!hideWeekends && day.dayOfWeek <= 7) ||
      (hideWeekends && day.dayOfWeek <= 5),
  );

  // Calculate the date range for expanding recurring events
  const rangeStart = days[0] ?? startDate;
  const rangeEnd = days[days.length - 1] ?? startDate;

  // Expand recurring events for this date range
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
      dayOfWeek: DAYS_OF_WEEK[date.dayOfWeek] ?? "Mon",
      dayNumber: date.day,
      isToday: isSameDay(date, today),
      events: positionedEvents,
    };
  });
}
