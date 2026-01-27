import { CalendarEvent, PositionedEvent } from "./types";
import { formatTime } from "./utils";

export interface EventBlockProps {
  event: PositionedEvent;
  onClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
}

export function EventBlock({ event, onClick, renderEvent }: EventBlockProps) {
  const handleClick = () => {
    onClick?.(event);
  };

  const backgroundClasses = event.backgroundColour;
  const subSection = event.subSection;
  const type = event.type;

  return (
    <div
      className="absolute cursor-pointer overflow-hidden px-0.5"
      style={{
        top: `${event.top}%`,
        height: `${event.height}%`,
        left: `${event.left}%`,
        width: `${event.width}%`,
      }}
      onClick={handleClick}
    >
      {renderEvent ? (
        renderEvent(event)
      ) : (
        <div
          className={`h-full space-y-1 rounded-md border-l-4 px-1 py-2 text-xs ${backgroundClasses}`}
        >
          <p className="truncate leading-tight">
            <span className="font-semibold">{event.title}</span>&nbsp;
            <span className="font-normal">
              - {subSection} ({type})
            </span>
          </p>

          <p className="truncate leading-tight font-light">
            {formatTime(event.start)} - {formatTime(event.end)}
          </p>
        </div>
      )}
    </div>
  );
}
