import { SelectedSession } from "@/types/Types";
import dayjs from "dayjs";
import React from "react";

type ExtendedCalendarEvent = {
  id: string | number;
  title: string;
  start: string;
  end: string;
} & SelectedSession["courseDetails"];

export interface CalendarEventProps {
  calendarEvent: ExtendedCalendarEvent;
}

const TIME_FORMAT = "hh:mm";
export default function CalendarEvent({ calendarEvent }: CalendarEventProps) {
  const start = dayjs(calendarEvent.start).format(TIME_FORMAT);
  const end = dayjs(calendarEvent.end).format(TIME_FORMAT);
  return (
    <div
      className={`left-0 right-0 top-0 flex h-full cursor-pointer flex-col gap-1 rounded-sm border-l-4 p-2 ${calendarEvent.backgroundColour}`}
    >
      <div className="flex text-nowrap text-xs">
        <p className="font-bold">{calendarEvent.title}</p>
        &nbsp;-&nbsp;
        <p className="text-xs">{calendarEvent.subSection}</p>
        &nbsp;
        <p className="font-normal">({calendarEvent.type})</p>
      </div>

      <p className="text-nowrap font-light">
        {start} - {end}
      </p>
    </div>
  );
}
