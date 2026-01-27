import { Temporal } from "temporal-polyfill";
import { RRule } from "rrule";
import { CalendarEvent, DayColumn, PositionedEvent } from "./types";

const DAYS_OF_WEEK: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  // Temporal uses ISO weekday: 1 = Monday, 7 = Sunday
  const dayOfWeek = date.dayOfWeek;
  return date.subtract({ days: dayOfWeek - 1 });
}

/**
 * Get an array of days starting from the week start
 * @param hideWeekends - If true, returns only Mon-Fri (5 days)
 */
export function getWeekDays(
  weekStart: Temporal.PlainDate,
  timezone: string,
  hideWeekends: boolean = false,
): Temporal.PlainDate[] {
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  if (hideWeekends) {
    // Filter out Saturday (6) and Sunday (7)
    return days.filter(d => d.dayOfWeek <= 5);
  }
  return days;
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
  // Total hours displayed (inclusive), e.g., 8-18 = 11 hours
  const totalHours = dayEndHour - dayStartHour + 1;
  const totalMinutes = totalHours * 60;

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
 * Find all events that overlap with a given event (directly or transitively)
 */
function findOverlapCluster(
  event: CalendarEvent,
  allEvents: CalendarEvent[],
): CalendarEvent[] {
  const cluster: CalendarEvent[] = [event];
  const checked = new Set<string | number>([event.id]);

  let i = 0;
  while (i < cluster.length) {
    const current = cluster[i];
    for (const other of allEvents) {
      if (!checked.has(other.id) && current && eventsOverlap(current, other)) {
        cluster.push(other);
        checked.add(other.id);
      }
    }
    i++;
  }

  return cluster;
}

/**
 * Layout a cluster of overlapping events into columns
 */
function layoutCluster(
  cluster: CalendarEvent[],
  dayStartHour: number,
  dayEndHour: number,
): PositionedEvent[] {
  if (cluster.length === 0) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...cluster].sort((a, b) => {
    const startCompare = Temporal.ZonedDateTime.compare(a.start, b.start);
    if (startCompare !== 0) return startCompare;
    const aDuration = a.end.epochMilliseconds - a.start.epochMilliseconds;
    const bDuration = b.end.epochMilliseconds - b.start.epochMilliseconds;
    return bDuration - aDuration;
  });

  const columns: CalendarEvent[][] = [];
  const eventToColumn = new Map<string | number, number>();

  for (const event of sorted) {
    // Find first column where event doesn't overlap with any event in that column
    let placedInColumn = -1;
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const column = columns[colIdx];
      const hasOverlap = column?.some(e => eventsOverlap(e, event));
      if (!hasOverlap) {
        column?.push(event);
        placedInColumn = colIdx;
        break;
      }
    }

    if (placedInColumn === -1) {
      columns.push([event]);
      placedInColumn = columns.length - 1;
    }

    eventToColumn.set(event.id, placedInColumn);
  }

  const totalColumns = columns.length;

  return sorted.map(event => {
    const { top, height } = calculateEventPosition(
      event,
      dayStartHour,
      dayEndHour,
    );
    const column = eventToColumn.get(event.id) ?? 0;

    return {
      ...event,
      top,
      height,
      left: (column / totalColumns) * 100,
      width: 100 / totalColumns,
      column,
      totalColumns,
    };
  });
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

  const positioned: PositionedEvent[] = [];
  const processed = new Set<string | number>();

  for (const event of events) {
    if (processed.has(event.id)) continue;

    // Find all events in this overlap cluster
    const cluster = findOverlapCluster(event, events);

    // Mark all as processed
    for (const e of cluster) {
      processed.add(e.id);
    }

    // Layout the cluster
    const layouted = layoutCluster(cluster, dayStartHour, dayEndHour);
    positioned.push(...layouted);
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
 * Expand recurring events into individual event instances for a date range
 * @param events - Array of events, some of which may have rrule
 * @param rangeStart - Start of the date range to expand into
 * @param rangeEnd - End of the date range to expand into
 * @param timezone - Timezone for the events
 * @returns Array of expanded events (recurring events become multiple instances)
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
  timezone: string,
): CalendarEvent[] {
  const expandedEvents: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.rrule) {
      // Non-recurring event - check if it falls within the range
      const eventDate = event.start.toPlainDate();
      if (
        Temporal.PlainDate.compare(eventDate, rangeStart) >= 0 &&
        Temporal.PlainDate.compare(eventDate, rangeEnd) <= 0
      ) {
        expandedEvents.push(event);
      }
      continue;
    }

    // Parse the RRULE and expand occurrences
    try {
      // Calculate event duration for creating instances
      const durationMs =
        event.end.epochMilliseconds - event.start.epochMilliseconds;

      // Create range boundaries as Date objects for rrule
      // Expand range by 1 day on each side to handle timezone edge cases
      const rangeStartDate = new Date(
        rangeStart.subtract({ days: 1 }).toZonedDateTime(timezone)
          .epochMilliseconds,
      );
      const rangeEndDate = new Date(
        rangeEnd.add({ days: 1 }).toZonedDateTime(timezone).epochMilliseconds,
      );

      // Parse RRULE - use the rrule library's RRule constructor
      // Convert the event start to a JS Date for the dtstart
      const dtstart = new Date(event.start.epochMilliseconds);

      // Parse the RRULE options from the string
      // The rrule string may already include "RRULE:" prefix or may include DTSTART
      const rruleString = event.rrule.includes("RRULE:")
        ? event.rrule
        : `RRULE:${event.rrule}`;
      const rule = RRule.fromString(rruleString);

      // Create a new rule with the dtstart from the event (override any DTSTART in the rrule)
      const ruleWithStart = new RRule({
        ...rule.origOptions,
        dtstart,
      });

      // Get all occurrences within the range
      const occurrences = ruleWithStart.between(
        rangeStartDate,
        rangeEndDate,
        true,
      );

      for (const occurrence of occurrences) {
        // Convert occurrence date to Temporal
        const occurrenceInstant = Temporal.Instant.fromEpochMilliseconds(
          occurrence.getTime(),
        );
        const occurrenceZdt = occurrenceInstant.toZonedDateTimeISO(timezone);

        // Create a new event instance at this occurrence time
        // Preserve the original time of day from the event
        const instanceStart = occurrenceZdt.toPlainDate().toZonedDateTime({
          timeZone: timezone,
          plainTime: event.start.toPlainTime(),
        });

        const instanceEnd = Temporal.Instant.fromEpochMilliseconds(
          instanceStart.epochMilliseconds + durationMs,
        ).toZonedDateTimeISO(timezone);

        // Only include if the instance actually falls within our range
        const instanceDate = instanceStart.toPlainDate();
        if (
          Temporal.PlainDate.compare(instanceDate, rangeStart) >= 0 &&
          Temporal.PlainDate.compare(instanceDate, rangeEnd) <= 0
        ) {
          expandedEvents.push({
            ...event,
            id: `${event.id}-${instanceStart.epochMilliseconds}`,
            start: instanceStart,
            end: instanceEnd,
            // Keep reference to original event
            _originalId: event.id,
            _isRecurrenceInstance: true,
          });
        }
      }
    } catch (error) {
      // If RRULE parsing fails, treat as non-recurring event
      console.warn(`Failed to parse RRULE for event ${event.id}:`, error);
      const eventDate = event.start.toPlainDate();
      if (
        Temporal.PlainDate.compare(eventDate, rangeStart) >= 0 &&
        Temporal.PlainDate.compare(eventDate, rangeEnd) <= 0
      ) {
        expandedEvents.push(event);
      }
    }
  }

  return expandedEvents;
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
  numDays?: number,
): DayColumn[] {
  const today = getToday(timezone);

  // Generate days starting from startDate
  let days: Temporal.PlainDate[];
  if (numDays !== undefined) {
    // Generate exactly numDays starting from startDate
    days = Array.from({ length: numDays }, (_, i) =>
      startDate.add({ days: i }),
    );
  } else {
    // Use the week days logic (7 days or 5 if hiding weekends)
    days = getWeekDays(startDate, timezone, hideWeekends);
  }

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
  const endMinutes = (dayEndHour + 1) * 60; // +1 because grid is inclusive

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
