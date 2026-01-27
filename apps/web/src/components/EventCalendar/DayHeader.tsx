import { DayColumn } from "./types";

export const DayHeader = ({ column }: { column: DayColumn }) => (
  <div
    className={`flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0 ${
      column.isToday ? "bg-primary/10" : ""
    }`}
  >
    <span className="text-muted-foreground text-xs">{column.dayOfWeek}</span>
    <span
      className={`flex h-6 w-6 items-center justify-center text-sm font-medium ${
        column.isToday ? "bg-primary text-primary-foreground rounded-full" : ""
      }`}
    >
      {column.dayNumber}
    </span>
  </div>
);
