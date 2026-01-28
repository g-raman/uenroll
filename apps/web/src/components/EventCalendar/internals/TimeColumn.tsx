interface HourLabel {
  hour: number;
  label: string;
}

interface TimeColumnProps {
  hourLabels: HourLabel[];
  gridHeight: number;
  paddingHeight: number;
  hourHeight: number;
  dayStartHour: number;
}

export function TimeColumn({
  hourLabels,
  gridHeight,
  paddingHeight,
  hourHeight,
  dayStartHour,
}: TimeColumnProps) {
  return (
    <div
      className="bg-background sticky left-0 z-10 w-16 flex-shrink-0 border-r"
      style={{ height: gridHeight }}
    >
      {hourLabels.map(({ hour, label }) => (
        <div
          key={hour}
          className="text-muted-foreground absolute right-2 text-xs"
          style={{
            top: paddingHeight + (hour - dayStartHour) * hourHeight,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
