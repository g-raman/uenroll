import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Clock, User, Check, FileText } from "lucide-react";
import { PositionedEvent } from "./types";
import { formatTime } from "./dateUtils";

interface EventPopoverProps {
  event: PositionedEvent;
  children: React.ReactNode;
  disabled?: boolean;
}

export function EventPopover({ event, children, disabled }: EventPopoverProps) {
  const alternativesCount = event.alternatives?.length ?? 0;
  const combinedText =
    alternativesCount > 0 ? ` (+${alternativesCount} combined)` : "";

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-80">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div
            className={`h-4 w-4 rounded-sm ${event.backgroundColour}`}
            aria-hidden
          />
          <span>
            <span className="font-bold">{event.courseCode}</span>
            <span className="font-normal">
              {" "}
              - {event.subSection} ({event.type})
            </span>
          </span>
        </div>

        <div className="space-y-2">
          {/* Course Title */}
          <div className="flex items-start gap-3">
            <FileText className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {event.courseTitle}
              {combinedText}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {formatTime(event.start)} - {formatTime(event.end)}
            </span>
          </div>

          {/* Instructor */}
          {event.instructor && (
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{event.instructor}</span>
            </div>
          )}

          {/* Open/Closed Status */}
          <div className="flex items-center gap-3">
            <Check
              className={`h-4 w-4 flex-shrink-0 ${event.isOpen ? "text-green-500" : "text-red-500"}`}
            />
            <span
              className={`text-sm ${event.isOpen ? "text-green-500" : "text-red-500"}`}
            >
              {event.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
