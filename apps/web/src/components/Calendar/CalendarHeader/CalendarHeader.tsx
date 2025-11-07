"use no memo";

import { CopyLinkButton } from "@/components/Buttons/CopyLinkButton/CopyLinkButton";
import DownloadCalendarButton from "@/components/Buttons/DownloadCalendarButton/DownloadCalendarButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useTermParam } from "@/hooks/useTermParam";
import { TIMEZONE } from "@/utils/constants";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import { CalendarConfig } from "@schedule-x/calendar";
import { useCallback } from "react";

export interface App {
  config: CalendarConfig & {
    plugins: {
      calendarControls: {
        getDate: () => Temporal.PlainDate;
        getRange: () => {
          start: Temporal.ZonedDateTime;
          end: Temporal.ZonedDateTime;
        };
        setDate: (date: Temporal.PlainDate) => void;
        setFirstDayOfWeek: (firstDayOfWeek: number) => void;
      };
    };
  };
}

interface CalendarHeaderProps {
  $app: App;
  delta: number;
}

export default function CalendarHeader({ $app, delta }: CalendarHeaderProps) {
  const [term] = useTermParam();

  const date = $app.config.plugins.calendarControls.getDate();
  const { start, end } = $app.config.plugins.calendarControls.getRange();
  const { width } = useScreenSize();

  const monthStart = start.toLocaleString("en-CA", {
    year: "numeric",
    month: width && width <= 768 ? "short" : "long",
  });
  const monthEnd = end.toLocaleString("en-CA", {
    year: "numeric",
    month: width && width <= 768 ? "short" : "long",
  });

  const handleNextOrPrevious = useCallback(
    (change: number) => {
      const newDate = date.add({ days: change });
      const dayOfWeek = delta === 7 ? 1 : newDate.dayOfWeek;

      $app.config.plugins.calendarControls.setDate(newDate);
      $app.config.plugins.calendarControls.setFirstDayOfWeek(dayOfWeek);
    },
    [$app.config.plugins.calendarControls, date, delta],
  );

  return (
    <>
      <div className="flex h-full w-full flex-wrap items-center gap-2">
        <Button
          className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! border px-2 text-xs text-black lg:px-6 dark:text-white"
          variant="default"
          size="lg"
          onClick={() =>
            $app.config.plugins.calendarControls.setDate(
              term === "2259"
                ? Temporal.PlainDate.from("2025-09-03")
                : term === "2261"
                  ? Temporal.PlainDate.from("2026-01-12")
                  : Temporal.Now.zonedDateTimeISO(TIMEZONE).toPlainDate(),
            )
          }
        >
          Term Start
        </Button>

        <p className="max-w-10 truncate text-xs font-bold min-[428px]:max-w-24 lg:max-w-full lg:text-base">
          {monthStart === monthEnd ? monthStart : `${monthStart} - ${monthEnd}`}
        </p>

        <div className="ml-auto space-x-1">
          <CopyLinkButton />
          <DownloadCalendarButton />
          <Button
            className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! border text-black dark:text-white"
            onClick={() => handleNextOrPrevious(delta * -1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>

          <Button
            className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! border text-black dark:text-white"
            onClick={() => handleNextOrPrevious(delta)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </div>
      </div>
    </>
  );
}
