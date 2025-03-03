import { SelectedSession } from "@/types/Types";
import { faClock, faClockFour } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      className={`flex flex-col gap-1 top-0 left-0 right-0 h-min p-2 rounded bg-opacity-60 border-l-4 ${calendarEvent.backgroundColour}`}
    >
      <div className="text-xs text-nowrap flex">
        <p className="font-bold">{calendarEvent.title}</p>
        &nbsp;-&nbsp;
        <p className="text-xs">{calendarEvent.subSection}</p>
        &nbsp;
        <p className="font-normal">({calendarEvent.type})</p>
      </div>

      <p className="font-light text-nowrap">
        {start} - {end}
      </p>
    </div>
  );
}
