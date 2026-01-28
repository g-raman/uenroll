import { Temporal } from "temporal-polyfill";
import { RRule } from "rrule";
import { CalendarEvent } from "./types";

function isDateInRange(
  date: Temporal.PlainDate,
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
): boolean {
  return (
    Temporal.PlainDate.compare(date, rangeStart) >= 0 &&
    Temporal.PlainDate.compare(date, rangeEnd) <= 0
  );
}

function createEventInstance(
  event: CalendarEvent,
  occurrenceDate: Date,
  durationMs: number,
  timezone: string,
): CalendarEvent {
  const occurrenceInstant = Temporal.Instant.fromEpochMilliseconds(
    occurrenceDate.getTime(),
  );
  const occurrenceZdt = occurrenceInstant.toZonedDateTimeISO(timezone);

  // Preserve the original time of day from the event
  const instanceStart = occurrenceZdt.toPlainDate().toZonedDateTime({
    timeZone: timezone,
    plainTime: event.start.toPlainTime(),
  });

  const instanceEnd = Temporal.Instant.fromEpochMilliseconds(
    instanceStart.epochMilliseconds + durationMs,
  ).toZonedDateTimeISO(timezone);

  return {
    ...event,
    id: `${event.id}-${instanceStart.epochMilliseconds}`,
    start: instanceStart,
    end: instanceEnd,
  };
}

function expandSingleRecurringEvent(
  event: CalendarEvent,
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
  timezone: string,
): CalendarEvent[] {
  if (!event.rrule) return [];

  try {
    const durationMs =
      event.end.epochMilliseconds - event.start.epochMilliseconds;

    // Expand range by 1 day on each side to handle timezone edge cases
    const rangeStartDate = new Date(
      rangeStart.subtract({ days: 1 }).toZonedDateTime(timezone)
        .epochMilliseconds,
    );
    const rangeEndDate = new Date(
      rangeEnd.add({ days: 1 }).toZonedDateTime(timezone).epochMilliseconds,
    );

    const rule = RRule.fromString(event.rrule);

    const dtstart = new Date(event.start.epochMilliseconds);
    const ruleWithStart = new RRule({
      ...rule.origOptions,
      dtstart,
    });

    const occurrences = ruleWithStart.between(
      rangeStartDate,
      rangeEndDate,
      true,
    );

    const instances: CalendarEvent[] = [];

    for (const occurrence of occurrences) {
      const instance = createEventInstance(
        event,
        occurrence,
        durationMs,
        timezone,
      );
      const instanceDate = instance.start.toPlainDate();

      if (isDateInRange(instanceDate, rangeStart, rangeEnd)) {
        instances.push(instance);
      }
    }

    return instances;
  } catch (error) {
    console.warn(`Failed to parse RRULE for event ${event.id}:`, error);
    return [];
  }
}

export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
  timezone: string,
): CalendarEvent[] {
  const expandedEvents: CalendarEvent[] = [];

  for (const event of events) {
    const eventDate = event.start.toPlainDate();
    if (!event.rrule) {
      if (isDateInRange(eventDate, rangeStart, rangeEnd)) {
        expandedEvents.push(event);
      }
      continue;
    }
    }

    const instances = expandSingleRecurringEvent(
      event,
      rangeStart,
      rangeEnd,
      timezone,
    );

    if (instances.length > 0) {
      expandedEvents.push(...instances);
    } else if (isDateInRange(eventDate, rangeStart, rangeEnd)) {
      // Fallback: if RRULE parsing fails, treat as non-recurring
      expandedEvents.push(event);
    }
  }

  return expandedEvents;
}
