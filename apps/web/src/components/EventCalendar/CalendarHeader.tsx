import { Temporal } from "temporal-polyfill";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DownloadCalendarButton from "@/components/Buttons/DownloadCalendarButton";
import { CopyLinkButton } from "@/components/Buttons/CopyLinkButton";
import { formatWeekRange } from "./dateUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useTranslation } from "react-i18next";

interface CalendarHeaderProps {
  weekStart: Temporal.PlainDate;
  weekendsHidden: boolean;
  onWeekendsHiddenChange: (hidden: boolean) => void;
  onNavigate: (direction: "next" | "previous") => void;
  onGoToTermStart: () => void;
}

export function CalendarHeader({
  weekStart,
  weekendsHidden,
  onWeekendsHiddenChange,
  onNavigate,
  onGoToTermStart,
}: CalendarHeaderProps) {
  const { t } = useTranslation();

  const monthNamesShort = t("calendar.monthsShort", {
    returnObjects: true,
  }) as string[];
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onGoToTermStart}>
          {t("calendar.termStart")}
        </Button>
        <h2 className="truncate text-base font-semibold text-nowrap">
          {formatWeekRange(weekStart, monthNamesShort)}
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="hidden items-center gap-2 text-sm lg:flex">
          <Switch
            className="cursor-pointer"
            checked={weekendsHidden}
            onCheckedChange={onWeekendsHiddenChange}
          />
          <span className="text-muted-foreground">
            {" "}
            {t("calendar.hideWeekends")}
          </span>
        </label>

        <div className="flex gap-2">
          <DownloadCalendarButton />
          <CopyLinkButton />
        </div>

        <div className="hidden items-center lg:flex">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => onNavigate("previous")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              }
            />

            <TooltipContent>{t("calendar.previousWeek")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => onNavigate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              }
            />

            <TooltipContent>{t("calendar.nextWeek")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
