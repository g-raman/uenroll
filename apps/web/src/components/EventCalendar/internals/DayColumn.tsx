import { DayColumn } from "@/components/EventCalendar/types";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { EventBlock } from "@/components/EventCalendar/EventBlock";

export interface DayColumnProps {
  column: DayColumn;
  hourHeight: number;
  gridHeight: number;
  paddingHeight: number;
  dayStartHour: number;
  dayEndHour: number;
  currentTimePosition: number | null;
  popoverDisabled?: boolean;
}

export function DayColumnComponent({
  column,
  hourHeight,
  gridHeight,
  paddingHeight,
  dayStartHour,
  dayEndHour,
  currentTimePosition,
  popoverDisabled,
}: DayColumnProps) {
  const totalHours = dayEndHour - dayStartHour + 1;
  const contentHeight = totalHours * hourHeight;

  return (
    <div
      className="relative flex-1 border-r last:border-r-0"
      style={{ height: gridHeight }}
    >
      {/* Hour grid lines */}
      {Array.from({ length: totalHours + 1 }, (_, i) => (
        <div
          key={i}
          className="border-border/50 absolute right-0 left-0 border-b"
          style={{ top: paddingHeight + i * hourHeight }}
        />
      ))}

      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <CurrentTimeIndicator
          position={currentTimePosition}
          paddingHeight={paddingHeight}
          contentHeight={contentHeight}
        />
      )}

      {/* Events container */}
      <div
        className="absolute right-0 left-0"
        style={{ top: paddingHeight, height: contentHeight }}
      >
        {column.events.map(event => (
          <EventBlock
            key={event.id}
            event={event}
            popoverDisabled={popoverDisabled}
          />
        ))}
      </div>
    </div>
  );
}
