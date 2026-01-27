import { Temporal } from "temporal-polyfill";
import { CalendarEvent, DayColumn, PositionedEvent } from "./types";

const DAYS_OF_WEEK: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek === 7 ? 0 : date.dayOfWeek; // Convert ISO (1-7, Mon-Sun) to 0-6 (Sun-Sat)
  return date.subtract({ days: dayOfWeek });
}

/**
 * Get an array of 7 days starting from the week start
 */
export function getWeekDays(
  weekStart: Temporal.PlainDate,
  timezone: string,
): Temporal.PlainDate[] {
  return Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

/**
 * Get today's date in a specific timezone
 */
export function getToday(timezone: string): Temporal.PlainDate {
  return Temporal.Now.zonedDateTimeISO(timezone).toPlainDate();
}

/**
 * Format time for display (e.g., "9 AM", "2 PM")
 */
export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Format time with minutes (e.g., "9:30 AM")
 */
export function formatTime(zonedDateTime: Temporal.ZonedDateTime): string {
  const hour = zonedDateTime.hour;
  const minute = zonedDateTime.minute;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Calculate the vertical position and height of an event
 */
function calculateEventPosition(
  event: CalendarEvent,
  dayStartHour: number,
  dayEndHour: number,
): { top: number; height: number } {
  const totalMinutes = (dayEndHour - dayStartHour) * 60;

  const startMinutes =
    (event.start.hour - dayStartHour) * 60 + event.start.minute;
  const endMinutes = (event.end.hour - dayStartHour) * 60 + event.end.minute;

  const top = Math.max(0, (startMinutes / totalMinutes) * 100);
  const height = Math.max(
    2,
    ((endMinutes - startMinutes) / totalMinutes) * 100,
  );

  return { top, height };
}

/**
 * Check if two events overlap in time
 */
function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return (
    Temporal.ZonedDateTime.compare(a.start, b.end) < 0 &&
    Temporal.ZonedDateTime.compare(b.start, a.end) < 0
  );
}

/**
 * Layout overlapping events into columns
 */
function layoutOverlappingEvents(
  events: CalendarEvent[],
  dayStartHour: number,
  dayEndHour: number,
): PositionedEvent[] {
  if (events.length === 0) return [];

  // Sort events by start time, then by duration (longer first)
  const sortedEvents = [...events].sort((a, b) => {
    const startCompare = Temporal.ZonedDateTime.compare(a.start, b.start);
    if (startCompare !== 0) return startCompare;
    // Longer events first
    const aDuration = a.end.epochMilliseconds - a.start.epochMilliseconds;
    const bDuration = b.end.epochMilliseconds - b.start.epochMilliseconds;
    return bDuration - aDuration;
  });

  const positioned: PositionedEvent[] = [];
  const columns: CalendarEvent[][] = [];

  for (const event of sortedEvents) {
    // Find a column where this event doesn't overlap with the last event
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const lastInColumn = column?.[column.length - 1];
      if (lastInColumn && !eventsOverlap(event, lastInColumn)) {
        column.push(event);
        const { top, height } = calculateEventPosition(
          event,
          dayStartHour,
          dayEndHour,
        );
        positioned.push({
          ...event,
          top,
          height,
          left: 0,
          width: 100,
          column: i,
          totalColumns: 0,
        });
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
      const { top, height } = calculateEventPosition(
        event,
        dayStartHour,
        dayEndHour,
      );
      positioned.push({
        ...event,
        top,
        height,
        left: 0,
        width: 100,
        column: columns.length - 1,
        totalColumns: 0,
      });
    }
  }

  // Calculate widths and positions for overlapping events
  const totalColumns = columns.length;
  for (const pos of positioned) {
    pos.totalColumns = totalColumns;
    pos.width = 100 / totalColumns;
    pos.left = pos.column * pos.width;
  }

  return positioned;
}

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
 */
export function buildDayColumns(
  events: CalendarEvent[],
  weekStart: Temporal.PlainDate,
  timezone: string,
  dayStartHour: number,
  dayEndHour: number,
): DayColumn[] {
  const today = getToday(timezone);
  const weekDays = getWeekDays(weekStart, timezone);

  return weekDays.map(date => {
    const dayEvents = getEventsForDay(events, date);
    const positionedEvents = layoutOverlappingEvents(
      dayEvents,
      dayStartHour,
      dayEndHour,
    );
    const dayOfWeekIndex = date.dayOfWeek === 7 ? 0 : date.dayOfWeek;

    return {
      date,
      dayOfWeek: DAYS_OF_WEEK[dayOfWeekIndex] ?? "Sun",
      dayNumber: date.day,
      isToday: isSameDay(date, today),
      events: positionedEvents,
    };
  });
}

/**
 * Generate hour labels for the time grid
 */
export function generateHourLabels(
  dayStartHour: number,
  dayEndHour: number,
): { hour: number; label: string }[] {
  const hours: { hour: number; label: string }[] = [];
  for (let hour = dayStartHour; hour <= dayEndHour; hour++) {
    hours.push({ hour, label: formatHour(hour) });
  }
  return hours;
}

/**
 * Get the current time position as a percentage
 */
export function getCurrentTimePosition(
  timezone: string,
  dayStartHour: number,
  dayEndHour: number,
): number | null {
  const now = Temporal.Now.zonedDateTimeISO(timezone);
  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = dayStartHour * 60;
  const endMinutes = dayEndHour * 60;

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return null;
  }

  return ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
}

/**
 * Format a date for display (e.g., "January 2026")
 */
export function formatMonthYear(date: Temporal.PlainDate): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[date.month - 1]} ${date.year}`;
}

/**
 * Format a date range for display (e.g., "Jan 20 - 26, 2026")
 */
export function formatWeekRange(weekStart: Temporal.PlainDate): string {
  const weekEnd = weekStart.add({ days: 6 });
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const startMonth = monthNames[weekStart.month - 1];
  const endMonth = monthNames[weekEnd.month - 1];

  if (weekStart.month === weekEnd.month) {
    return `${startMonth} ${weekStart.day} - ${weekEnd.day}, ${weekStart.year}`;
  }

  if (weekStart.year === weekEnd.year) {
    return `${startMonth} ${weekStart.day} - ${endMonth} ${weekEnd.day}, ${weekStart.year}`;
  }

  return `${startMonth} ${weekStart.day}, ${weekStart.year} - ${endMonth} ${weekEnd.day}, ${weekEnd.year}`;
}
