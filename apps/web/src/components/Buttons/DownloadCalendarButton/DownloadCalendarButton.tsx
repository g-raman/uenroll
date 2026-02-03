import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { useSchedules, useSelectedSchedule } from "@/stores/generatorStore";
import { useMode } from "@/stores/modeStore";
import { coursesToDownloadableCalendarEvents } from "@/utils/mappers/calendarDownloadable";
import { scheduleToSelected } from "@/utils/mappers/schedule";
import { Save } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import React, { useCallback } from "react";
import { generateIcsCalendar } from "ts-ics";

export default function DownloadCalendarButton() {
  const filename = "schedule.ics";
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});
  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const isGenerationMode = useMode();
  const schedules = useSchedules();
  const selecteSchedule = useSelectedSchedule();

  const hasAnySelectedSessions = data
    ? Object.values(data).some(value => value.length > 0)
    : false;

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const handleDownload = useCallback(async () => {
    const selected =
      isGenerationMode && selecteSchedule !== null && schedules[selecteSchedule]
        ? scheduleToSelected(schedules[selecteSchedule])
        : data;

    const events = coursesToDownloadableCalendarEvents(
      courseSearchResults,
      selected,
    );
    const calendar = generateIcsCalendar({
      version: "2.0",
      prodId: "//uEnroll//Calendar Export 1.0//EN",
      events,
    });

    const blob = new Blob([calendar], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }, [courseSearchResults, data, isGenerationMode, schedules, selecteSchedule]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="default"
            size="icon-lg"
            onClick={handleDownload}
            disabled={
              (isGenerationMode && schedules.length === 0) ||
              (!isGenerationMode && !hasAnySelectedSessions)
            }
          >
            <Save className="size-4" />
          </Button>
        }
      />
      <TooltipContent>
        <p>Download and add to your favourite app</p>
      </TooltipContent>
    </Tooltip>
  );
}
