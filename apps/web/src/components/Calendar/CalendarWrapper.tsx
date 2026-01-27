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

  // Get initial date: latest event's start date, or fall back to term start date
  const initialDate = useMemo(() => {
    if (events.length > 0) {
      const sorted = [...events].sort((a, b) =>
        Temporal.ZonedDateTime.compare(a.start, b.start),
      );
      return sorted.at(-1)!.start.toPlainDate();
    }

    const termStart = selectedTerm ? TERM_START_DATES[selectedTerm] : undefined;
    return termStart ? Temporal.PlainDate.from(termStart) : undefined;
  }, [events, selectedTerm]);

  return (
    <div className="flex h-full flex-col gap-2 bg-black md:gap-4">
      <GenerationHeader />
      <div className="h-full overflow-hidden rounded-t-md">
        <EventCalendar
          key={initialDate?.toString() ?? "default"}
          events={events}
          config={{ initialDate }}
        />
      </div>
    </div>
  );
}
