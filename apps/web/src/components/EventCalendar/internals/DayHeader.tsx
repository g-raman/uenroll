import { DayColumn } from "@/components/EventCalendar/types";
import { useTranslation } from "react-i18next";

export const DayHeader = ({ column }: { column: DayColumn }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0 ${
        column.isToday ? "bg-primary/10" : ""
      }`}
    >
      <span className="text-xs text-muted-foreground">
        {t(column.dayOfWeekKey)}
      </span>
      <span
        className={`flex h-6 w-6 items-center justify-center text-sm font-medium ${
          column.isToday
            ? "rounded-full bg-primary text-primary-foreground"
            : ""
        }`}
      >
        {column.dayNumber}
      </span>
    </div>
  );
};
