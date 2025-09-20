import { CalendarEventProps } from "../CalendarEvent/CalendarEvent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons/faClock";
import {
  faBook,
  faCheck,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getPlainStringTime } from "@/utils/calendarEvents";

export default function CalendarEventModal({
  calendarEvent,
}: CalendarEventProps) {
  const start = getPlainStringTime(calendarEvent.start);
  const end = getPlainStringTime(calendarEvent.end);

  return (
    <div className="shadow-sx bg-background h-min w-full space-y-2 rounded-md p-6">
      <div className="flex items-center text-lg">
        <div
          className={`rounded-xs mr-2 size-5 ${calendarEvent.backgroundColour}`}
        ></div>
        <p className="font-bold">{calendarEvent.courseCode}</p>
        &nbsp;-&nbsp;
        <p>{calendarEvent.subSection}</p>
      </div>

      <div className="flex items-center gap-2 text-base font-light">
        <FontAwesomeIcon icon={faBook} />
        <p>{calendarEvent.courseTitle}</p>
      </div>

      <div className="flex items-center gap-2 text-base font-light">
        <FontAwesomeIcon icon={faClock} />
        <p className="text-nowrap">
          {start} - {end}
        </p>
      </div>

      <div className="flex items-center gap-2 text-base font-light">
        <FontAwesomeIcon icon={faUser} />
        <p className="text-nowrap">{calendarEvent.instructor}</p>
      </div>

      <div className="flex items-center gap-2 text-base font-light">
        <FontAwesomeIcon
          className={`${calendarEvent.isOpen ? "text-green-400" : "text-red-500"}`}
          icon={calendarEvent.isOpen ? faCheck : faXmark}
        />
        <p className="text-nowrap">
          {calendarEvent.isOpen ? "Open" : "Closed"}
        </p>
      </div>
    </div>
  );
}
