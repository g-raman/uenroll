"use client";

import "temporal-polyfill/global";

import { useTermParam } from "@/hooks/useTermParam";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import {
  coursesToCalendarAppEvents,
  scheduleToCalendarAppEvents,
} from "@/utils/mappers/calendar";
import { useMode } from "@/stores/modeStore";
import { useSchedules, useSelectedSchedule } from "@/stores/generatorStore";
import { Calendar } from "@/components/Calendar/Calendar";
import { GenerationHeader } from "./GenerationHeader";

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

  const events = isGenerationMode
    ? selectedSchedule !== null && schedules[selectedSchedule]
      ? scheduleToCalendarAppEvents(schedules[selectedSchedule])
      : []
    : coursesToCalendarAppEvents(courseSearchResults, data);

  return (
    <div className="h-full space-y-4 overflow-y-scroll">
      <GenerationHeader />
      <Calendar events={events} />
      {events.length === 0 ? (
        <p className="mt-8 h-max w-full text-center lg:hidden">
          No courses selected.
        </p>
      ) : (
        ""
      )}
    </div>
  );
}
