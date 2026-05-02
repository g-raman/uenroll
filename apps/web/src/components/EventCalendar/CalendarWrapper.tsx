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
import { EventCalendar } from "@/components/EventCalendar/EventCalendar";

const TERM_START_DATES = {
  "2265": "2026-05-04", // 2026 Spring/Summer Term
} as const;

function isKnownTerm(term: string): term is keyof typeof TERM_START_DATES {
  return Object.hasOwn(TERM_START_DATES, term);
}

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

  const termStartDate =
    selectedTerm && isKnownTerm(selectedTerm)
      ? TERM_START_DATES[selectedTerm]
      : undefined;

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

    return termStartDate ? Temporal.PlainDate.from(termStartDate) : undefined;
  }, [events, termStartDate]);

  if (!selectedTerm) return null;

  if (!termStartDate) {
    console.error("Missing term start date for selected term", {
      selectedTerm,
      knownTerms: Object.keys(TERM_START_DATES),
    });
    return null;
  }

  const termStart = Temporal.PlainDate.from(termStartDate);

  return (
    <div className="flex flex-col gap-2 bg-black md:h-full md:gap-4">
      <GenerationHeader />
      <div className="overflow-hidden rounded-t-md md:h-full">
        <EventCalendar
          key={initialDate?.toString() ?? "default"}
          events={events}
          config={{ initialDate, termStart }}
        />
      </div>
    </div>
  );
}
