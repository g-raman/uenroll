import { EventBlock } from "./EventBlock";
import { CalendarEvent, DayColumn } from "./types";

export interface DayColumnProps {
  column: DayColumn;
  hourHeight: number;
  gridHeight: number;
  paddingHeight: number;
  dayStartHour: number;
  dayEndHour: number;
  currentTimePosition: number | null;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
}

export function DayColumnComponent({
  column,
  hourHeight,
  gridHeight,
  paddingHeight,
  dayStartHour,
  dayEndHour,
  currentTimePosition,
  onEventClick,
  renderEvent,
}: DayColumnProps) {
  const totalHours = dayEndHour - dayStartHour + 1;
  const contentHeight = totalHours * hourHeight;

  return (
    <div
      className="relative flex-1 border-r last:border-r-0"
      style={{ height: gridHeight }}
    >
      {/* Hour grid lines - offset by padding */}
      {Array.from({ length: totalHours + 1 }, (_, i) => (
        <div
          key={i}
          className="border-border/50 absolute right-0 left-0 border-b"
          style={{ top: paddingHeight + i * hourHeight }}
        />
      ))}

      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div
          className="pointer-events-none absolute right-0 left-0 flex items-center"
          style={{
            top: paddingHeight + (currentTimePosition / 100) * contentHeight,
          }}
        >
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-[2px] flex-1 bg-red-500" />
        </div>
      )}

      {/* Events container - offset by padding */}
      <div
        className="absolute right-0 left-0"
        style={{ top: paddingHeight, height: contentHeight }}
      >
        {column.events.map(event => (
          <EventBlock
            key={event.id}
            event={event}
            onClick={onEventClick}
            renderEvent={renderEvent}
          />
        ))}
      </div>
    </div>
  );
}
