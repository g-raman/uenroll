import React from "react";
import { CalendarEventProps } from "../CalendarEvent/CalendarEvent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons/faClock";
import {
  faBook,
  faCheck,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

const TIME_FORMAT = "hh:mm A";
export default function CalendarEventModal({
  calendarEvent,
}: CalendarEventProps) {
  const start = dayjs(calendarEvent.start).format(TIME_FORMAT);
  const end = dayjs(calendarEvent.end).format(TIME_FORMAT);

  return (
    <div className="w-full h-min bg-slate-50 p-6 space-y-2 rounded-md shadow-sx">
      <div className="flex items-center text-lg">
        <div
          className={`size-5 mr-2 rounded-sm ${calendarEvent.backgroundColour}`}
        >
        </div>
        <p className="font-bold">{calendarEvent.courseCode}</p>
        &nbsp;-&nbsp;
        <p>{calendarEvent.subSection}</p>
      </div>

      <div className="text-base flex items-center gap-2 font-light">
        <FontAwesomeIcon icon={faBook} />
        <p>{calendarEvent.courseTitle}</p>
      </div>

      <div className="text-base flex items-center gap-2 font-light">
        <FontAwesomeIcon icon={faClock} />
        <p className="text-nowrap">
          {start} - {end}
        </p>
      </div>

      <div className="text-base flex items-center gap-2 font-light">
        <FontAwesomeIcon icon={faUser} />
        <p className="text-nowrap">{calendarEvent.instructor}</p>
      </div>

      <div className="text-base flex items-center gap-2 font-light">
        <FontAwesomeIcon
          className={`${
            calendarEvent.isOpen ? "text-green-400" : "text-red-500"
          }`}
          icon={calendarEvent.isOpen ? faCheck : faXmark}
        />
        <p className="text-nowrap">
          {calendarEvent.isOpen ? "Open" : "Closed"}
        </p>
      </div>
    </div>
  );
}
