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
      className="sticky left-0 z-10 w-16 flex-shrink-0 border-r bg-background"
      style={{ height: gridHeight }}
    >
      {hourLabels.map(({ hour, label }) => (
        <div
          key={hour}
          className="absolute right-2 text-xs text-muted-foreground"
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
