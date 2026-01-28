import { PositionedEvent } from "./types";
import { formatTime } from "./dateUtils";

interface EventBlockProps {
  event: PositionedEvent;
}

export function EventBlock({ event }: EventBlockProps) {
  return (
    <div
      className="absolute cursor-pointer overflow-hidden px-0.5"
      style={{
        top: `${event.top}%`,
        height: `${event.height}%`,
        left: `${event.left}%`,
        width: `${event.width}%`,
      }}
    >
      <div
        className={`h-full space-y-1 rounded-md border-l-4 px-1 py-2 text-xs ${event.backgroundColour}`}
      >
        <p className="truncate leading-tight">
          <span className="font-semibold">{event.title}</span>&nbsp;
          <span className="font-normal">
            - {event.subSection} ({event.type})
          </span>
        </p>

        <p className="truncate leading-tight font-light">
          {formatTime(event.start)} - {formatTime(event.end)}
        </p>
      </div>
    </div>
  );
}
