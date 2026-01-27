"use client";

import "temporal-polyfill/global";

import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";
import { useTermParam } from "@/hooks/useTermParam";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import {
  coursesToCalendarAppEvents,
  scheduleToCalendarAppEvents,
} from "@/utils/mappers/calendar";
import { useMode } from "@/stores/modeStore";
import { useSchedules, useSelectedSchedule } from "@/stores/generatorStore";
import { GenerationHeader } from "./GenerationHeader";
import { EventCalendar } from "@/components/EventCalendar";

// Map term codes to their start dates
const TERM_START_DATES: Record<string, string> = {
  "2259": "2025-09-03", // Fall 2025
  "2261": "2026-01-12", // Winter 2026
};

export function CalendarWrapper() {
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});
  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();
  const isGenerationMode = useMode();

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const events = useMemo(() => {
    return isGenerationMode
      ? selectedSchedule !== null && schedules[selectedSchedule]
        ? scheduleToCalendarAppEvents(schedules[selectedSchedule])
        : []
      : coursesToCalendarAppEvents(courseSearchResults, data);
  }, [
    isGenerationMode,
    selectedSchedule,
    schedules,
    courseSearchResults,
    data,
  ]);

  // Calculate initial date: use latest event's start date, or term start date
  const initialDate = useMemo(() => {
    // If we have events, use the latest one's start date
    if (events.length > 0) {
      const sortedEvents = [...events].sort((a, b) =>
        Temporal.ZonedDateTime.compare(a.start, b.start),
      );
      const latestEvent = sortedEvents.at(-1);
      if (latestEvent) {
        return latestEvent.start.toPlainDate();
      }
    }

    // Fall back to term start date if available
    if (selectedTerm && TERM_START_DATES[selectedTerm]) {
      return Temporal.PlainDate.from(TERM_START_DATES[selectedTerm]);
    }

    // Default to today
    return undefined;
  }, [events, selectedTerm]);

  // Create a key based on the initial date to force remount when events load
  const calendarKey = initialDate?.toString() ?? "default";

  return (
    <div className="flex h-full flex-col gap-2 bg-black md:gap-4">
      <GenerationHeader />
      <div className="h-full overflow-hidden rounded-t-md">
        <EventCalendar
          key={calendarKey}
          events={events}
          config={{
            initialDate,
          }}
        />
      </div>
    </div>
  );
}
