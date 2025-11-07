import { SelectedSession } from "@/types/Types";
import { getPlainStringTime } from "@/utils/datetime";

type ExtendedCalendarEvent = {
  id: string | number;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  alternatives: string[];
} & SelectedSession["courseDetails"];

export interface CalendarEventProps {
  calendarEvent: ExtendedCalendarEvent;
}

export default function CalendarEvent({ calendarEvent }: CalendarEventProps) {
  const start = getPlainStringTime(calendarEvent.start);
  const end = getPlainStringTime(calendarEvent.end);

  return (
    <div
      className={`relative top-0 right-0 left-0 flex h-full cursor-pointer flex-col gap-1 rounded-sm border-l-4 p-2 ${calendarEvent.backgroundColour}`}
    >
      <div className="flex text-xs text-nowrap">
        <p className="font-bold">{calendarEvent.title}</p>
        &nbsp;-&nbsp;
        <p className="text-xs">{calendarEvent.subSection}</p>
        &nbsp;
        <p className="font-normal">({calendarEvent.type})</p>
      </div>

      {calendarEvent.alternatives.length > 0 && (
        <span className="absolute right-1 bottom-1 z-10 size-[16px] rounded-full !bg-black p-[2px] text-[10px] text-white">
          {`+${calendarEvent.alternatives.length}`}
        </span>
      )}

      <p className="font-light text-nowrap">
        {start} - {end}
      </p>
    </div>
  );
}
