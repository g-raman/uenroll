import { Temporal } from "temporal-polyfill";
import { CalendarEvent, PositionedEvent } from "./types";

/**
 * Calculate the vertical position and height of an event as percentages
 */
function calculateEventPosition(
  event: CalendarEvent,
  dayStartHour: number,
  dayEndHour: number,
): { top: number; height: number } {
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

function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return (
    Temporal.ZonedDateTime.compare(a.start, b.end) < 0 &&
    Temporal.ZonedDateTime.compare(b.start, a.end) < 0
  );
}

/**
 * Find all events that overlap with a given event (directly or transitively)
 * Uses BFS to find the complete overlap cluster
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

export function layoutOverlappingEvents(
  events: CalendarEvent[],
  dayStartHour: number,
  dayEndHour: number,
): PositionedEvent[] {
  if (events.length === 0) return [];

  const positioned: PositionedEvent[] = [];
  const processed = new Set<string | number>();

  for (const event of events) {
    if (processed.has(event.id)) continue;

    const cluster = findOverlapCluster(event, events);

    for (const e of cluster) {
      processed.add(e.id);
    }

    const layouted = layoutCluster(cluster, dayStartHour, dayEndHour);
    positioned.push(...layouted);
  }

  return positioned;
}
