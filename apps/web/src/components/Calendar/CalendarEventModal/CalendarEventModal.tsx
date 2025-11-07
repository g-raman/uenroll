import { CalendarEventProps } from "../CalendarEvent/CalendarEvent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons/faClock";
import {
  faBook,
  faCheck,
  faPuzzlePiece,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getPlainStringTime } from "@/utils/datetime";
import { Button } from "@repo/ui/components/button";
import { useState } from "react";

export default function CalendarEventModal({
  calendarEvent,
}: CalendarEventProps) {
  const start = getPlainStringTime(calendarEvent.start);
  const end = getPlainStringTime(calendarEvent.end);
  const [selected, setSelected] = useState(calendarEvent.subSection);

  return (
    <div className="shadow-sx bg-background h-min w-full space-y-2 rounded-md p-6">
      <div className="flex items-center text-lg">
        <div
          className={`rounded-xs mr-2 size-5 ${calendarEvent.backgroundColour}`}
        ></div>
        <p className="font-bold">{calendarEvent.courseCode}</p>
        &nbsp;-&nbsp;
        <p>{calendarEvent.subSection}</p>
        &nbsp;
        <p>({calendarEvent.type})</p>
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

      {calendarEvent.alternatives.length > 0 && (
        <>
          <hr />
          <div className="flex items-center gap-2 text-base font-light">
            <FontAwesomeIcon icon={faPuzzlePiece} />
            <div className="flex w-full items-center">
              <Button
                key={`alternative-${calendarEvent.courseCode}${calendarEvent.subSection}`}
                onClick={() => setSelected(calendarEvent.subSection)}
                size="sm"
                className={`rounded-xs hover:!bg-secondary-foreground/10 h-min w-min cursor-pointer px-2 ${selected === calendarEvent.subSection ? "!bg-primary hover:!bg-primary" : null}`}
              >
                {calendarEvent.subSection}
              </Button>

              {calendarEvent.alternatives.map(alternative => (
                <Button
                  key={`alternative-${calendarEvent.courseCode}${alternative}`}
                  variant={selected === alternative ? "default" : "ghost"}
                  onClick={() => setSelected(alternative)}
                  size="sm"
                  className={`rounded-xs hover:!bg-secondary-foreground/10 h-min w-min cursor-pointer px-2 ${selected === alternative ? "!bg-primary hover:!bg-primary" : null}`}
                >
                  {alternative}
                </Button>
              ))}
              <p className="ml-auto">(Alternatives)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
