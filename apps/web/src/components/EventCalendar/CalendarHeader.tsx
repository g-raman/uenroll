import { Temporal } from "temporal-polyfill";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DownloadCalendarButton from "../Buttons/DownloadCalendarButton/DownloadCalendarButton";
import { CopyLinkButton } from "../Buttons/CopyLinkButton/CopyLinkButton";
import { formatWeekRange } from "./dateUtils";

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
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onGoToTermStart}>
          Term Start
        </Button>
        <h2 className="truncate text-base font-semibold text-nowrap">
          {formatWeekRange(weekStart)}
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="hidden cursor-pointer items-center gap-2 text-sm lg:flex">
          <Switch
            checked={weekendsHidden}
            onCheckedChange={onWeekendsHiddenChange}
          />
          <span className="text-muted-foreground">Hide weekends</span>
        </label>

        <div className="flex gap-2">
          <DownloadCalendarButton />
          <CopyLinkButton />
        </div>

        <div className="hidden items-center lg:flex">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => onNavigate("previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
