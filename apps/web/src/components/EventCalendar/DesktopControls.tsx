import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DesktopControls = ({
  weekendsHidden,
  onWeekendsToggle,
  onPrevious,
  onNext,
}: {
  weekendsHidden: boolean;
  onWeekendsToggle: (checked: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center gap-4">
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Switch checked={weekendsHidden} onCheckedChange={onWeekendsToggle} />
      <span className="text-muted-foreground">Hide weekends</span>
    </label>
    <div className="flex items-center">
      <Button variant="ghost" size="icon" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
