import { useTermParam } from "@/hooks/useTermParam";
import { TIMEZONE } from "@/utils/constants";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import { CalendarConfig } from "@schedule-x/calendar";

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
      };
    };
  };
}

export default function CalendarHeader({ $app }: { $app: App }) {
  const [term] = useTermParam();

  const date = $app.config.plugins.calendarControls.getDate();
  const { start, end } = $app.config.plugins.calendarControls.getRange();

  const monthStart = start.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
  });
  const monthEnd = end.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="flex h-full w-full items-center gap-4">
      <Button
        className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! hidden border text-black lg:block dark:text-white"
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

      <p className="text-base font-bold">
        {monthStart === monthEnd ? monthStart : `${monthStart} - ${monthEnd}`}
      </p>

      <div className="ml-auto flex hidden gap-2 lg:block">
        <Button
          className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! border text-black dark:text-white"
          onClick={() =>
            $app.config.plugins.calendarControls.setDate(date.add({ days: -7 }))
          }
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </Button>

        <Button
          className="bg-background! shadow-xs! hover:bg-accent! hover:text-accent-foreground! dark:bg-input/30! dark:border-input! dark:hover:bg-input/50! border text-black dark:text-white"
          onClick={() =>
            $app.config.plugins.calendarControls.setDate(date.add({ days: 7 }))
          }
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>
    </div>
  );
}
