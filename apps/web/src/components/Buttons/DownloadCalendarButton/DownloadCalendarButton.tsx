import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { createDownloadableCalendarEvents } from "@/utils/calendarEvents";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  const hasAnySelectedSessions = Object.values(data ? data : {}).some(
    value => value.length > 0,
  );

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const handleDownload = useCallback(async () => {
    const events = createDownloadableCalendarEvents(courseSearchResults, data);
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
  }, [courseSearchResults, data]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="grow"
          variant="default"
          size="lg"
          onClick={handleDownload}
          disabled={!hasAnySelectedSessions}
        >
          <FontAwesomeIcon className="size-4" icon={faFileExport} />
          <p className="hidden text-xs min-[375px]:inline sm:inline md:hidden min-[1440px]:inline">
            Export
          </p>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Download and add to your favourite app</p>
      </TooltipContent>
    </Tooltip>
  );
}
