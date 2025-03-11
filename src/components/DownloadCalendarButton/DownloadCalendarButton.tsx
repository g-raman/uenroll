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
      className="cursor-pointer border-2 border-[#8f001b] text-[#8f001b] hover:bg-[#8f001b] hover:text-white disabled:hover:text-[#8f001b] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent transition-all font-semibold px-4 py-2 active:opacity-75 rounded-sm flex gap-1 items-center"
      onClick={handleDownload}
      disabled={state.selectedSessions.length === 0}
    >
      <FontAwesomeIcon className="size-4" icon={faFileExport} />
      <p>Export</p>
    </button>
  );
}
