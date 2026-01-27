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
import { GenerationHeader } from "./GenerationHeader";
import { EventCalendar } from "@/components/EventCalendar";

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
    <div className="flex h-full flex-col gap-2 bg-black md:gap-4">
      <GenerationHeader />
      <div className="h-full overflow-hidden rounded-t-md">
        <EventCalendar events={events} />
      </div>
    </div>
  );
}
