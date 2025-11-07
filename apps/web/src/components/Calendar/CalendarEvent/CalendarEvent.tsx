import { SelectedSession } from "@/types/Types";
import { getPlainStringTime } from "@/utils/datetime";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { useState } from "react";

// TODO: fix bug where deleting a course doesn't reset generated schedules state
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
  const [selected, setSelected] = useState<string>(calendarEvent.subSection);

  return (
    <div
      className={`relative left-0 right-0 top-0 flex h-full cursor-pointer flex-col gap-1 rounded-sm border-l-4 p-2 ${calendarEvent.backgroundColour}`}
    >
      <div className="flex text-nowrap text-xs">
        <p className="font-bold">{calendarEvent.title}</p>
        &nbsp;-&nbsp;
        <p className="text-xs">{calendarEvent.subSection}</p>
        &nbsp;
        <p className="font-normal">({calendarEvent.type})</p>
      </div>

      {calendarEvent.alternatives.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="absolute bottom-1 right-1 z-10 size-[16px] rounded-full !bg-black p-[2px] text-[10px]"
              size="sm"
              variant="default"
              onMouseDown={e => e.stopPropagation()}
            >
              {`+${calendarEvent.alternatives.length}`}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-min space-y-2 p-2">
            <p className="text-xs">Alternatives:</p>
            <div className="flex">
              <Button
                key={`alternative-${calendarEvent.courseCode}${calendarEvent.subSection}`}
                variant={
                  selected === calendarEvent.subSection ? "default" : "ghost"
                }
                onClick={() => setSelected(calendarEvent.subSection)}
                size="sm"
                className="rounded-xs h-min w-min"
              >
                {calendarEvent.subSection}
              </Button>

              {calendarEvent.alternatives.map(alternative => (
                <Button
                  key={`alternative-${calendarEvent.courseCode}${alternative}`}
                  variant={selected === alternative ? "default" : "ghost"}
                  onClick={() => setSelected(alternative)}
                  size="sm"
                  className="rounded-xs h-min w-min"
                >
                  {alternative}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <p className="text-nowrap font-light">
        {start} - {end}
      </p>
    </div>
  );
}
