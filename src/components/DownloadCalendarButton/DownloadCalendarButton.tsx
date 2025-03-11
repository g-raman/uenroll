import { useSearchResults } from "@/contexts/SearchResultsContext";
import { getCalendar } from "@/utils/generateICS";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    <button
      className="text-sm flex gap-2 justify-center items-center py-3 px-2 w-full h-full transition-all cursor-pointer hover:opacity-90 active:opacity-75 bg-[#8f001b] text-white rounded-xs"
      onClick={handleDownload}
      disabled={state.selectedSessions.length === 0}
    >
      <FontAwesomeIcon className="size-4" icon={faFileExport} />
    </button>
  );
}
