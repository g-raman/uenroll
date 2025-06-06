import { useSearchResults } from "@/contexts/SearchResultsContext";
import { getCalendar } from "@/utils/generateICS";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import React from "react";

export default function DownloadCalendarButton() {
  const filename = "schedule.ics";
  const { state } = useSearchResults();

  async function handleDownload() {
    const calendar = getCalendar(state.selectedSessions);
    const blob = new Blob([calendar], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  return (
    <Button
      className="flex-1"
      variant="default"
      size="lg"
      onClick={handleDownload}
      disabled={state.selectedSessions.length === 0}
    >
      <FontAwesomeIcon className="size-4" icon={faFileExport} />
      <p className="text-xs">Export</p>
    </Button>
  );
}
