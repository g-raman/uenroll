"use client";

import { Temporal } from "temporal-polyfill";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  CalendarEvent,
  EventCalendarProps,
  DayColumn,
  PositionedEvent,
} from "./types";
import {
  getWeekStart,
  getToday,
  buildDayColumns,
  generateHourLabels,
  getCurrentTimePosition,
  formatWeekRange,
  formatTime,
} from "./utils";

const DEFAULT_TIMEZONE = "America/Toronto";
const DEFAULT_DAY_START = 6;
const DEFAULT_DAY_END = 23;
const DEFAULT_HOUR_HEIGHT = 60;

// Breakpoints
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

export function EventCalendar({
  events,
  config = {},
  onEventClick,
  renderEvent,
  onDateChange,
}: EventCalendarProps) {
  const {
    timezone = DEFAULT_TIMEZONE,
    dayStartHour = DEFAULT_DAY_START,
    dayEndHour = DEFAULT_DAY_END,
    hourHeight = DEFAULT_HOUR_HEIGHT,
    showCurrentTime = true,
    initialDate,
    hideWeekends = false,
  } = config;

  const { width } = useScreenSize();

  const [currentDate, setCurrentDate] = useState<Temporal.PlainDate>(() => {
    return initialDate ?? getToday(timezone);
  });

  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(
    null,
  );

  const [weekendsHidden, setWeekendsHidden] = useState(hideWeekends);

  // Determine view mode based on screen size
  const isDesktop = width !== null && width >= TABLET_BREAKPOINT;
  const isTablet =
    width !== null && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const isMobile = width !== null && width < MOBILE_BREAKPOINT;

  // Number of days to show based on screen size
  const visibleDays = isDesktop ? (weekendsHidden ? 5 : 7) : isTablet ? 3 : 2;

  // Calculate week start from current date
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Build day columns with events
  const dayColumns = useMemo(() => {
    if (isDesktop) {
      // Desktop: show full week starting from Monday
      return buildDayColumns(
        events,
        weekStart,
        timezone,
        dayStartHour,
        dayEndHour,
        weekendsHidden,
      );
    }

    // Tablet/Mobile: show N days starting from current date
    return buildDayColumns(
      events,
      currentDate, // Start from current date, not week start
      timezone,
      dayStartHour,
      dayEndHour,
      false,
      visibleDays, // Limit to visible days
    );
  }, [
    events,
    weekStart,
    currentDate,
    timezone,
    dayStartHour,
    dayEndHour,
    weekendsHidden,
    isDesktop,
    visibleDays,
  ]);

  // Generate hour labels
  const hourLabels = useMemo(
    () => generateHourLabels(dayStartHour, dayEndHour),
    [dayStartHour, dayEndHour],
  );

  // Update current time indicator
  useEffect(() => {
    if (!showCurrentTime) return;

    const updateTime = () => {
      setCurrentTimePosition(
        getCurrentTimePosition(timezone, dayStartHour, dayEndHour),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timezone, dayStartHour, dayEndHour, showCurrentTime]);

  // Navigation handlers - move by week on desktop, by visible days on mobile/tablet
  const navigationDays = isDesktop ? 7 : visibleDays;

  const goToPrevious = () => {
    const newDate = currentDate.subtract({ days: navigationDays });
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const goToNext = () => {
    const newDate = currentDate.add({ days: navigationDays });
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    const today = getToday(timezone);
    setCurrentDate(today);
    onDateChange?.(today);
  };

  // Set date programmatically
  const setDate = (date: Temporal.PlainDate) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  const totalHours = dayEndHour - dayStartHour + 1;
  const gridHeight = totalHours * hourHeight;

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isDesktop && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch
                checked={weekendsHidden}
                onCheckedChange={setWeekendsHidden}
              />
              <span className="text-muted-foreground">Hide weekends</span>
            </label>
          )}
          <h2 className="text-lg font-semibold">
            {formatWeekRange(weekStart)}
          </h2>
        </div>
      </div>

      {/* Day Headers Row */}
      <div className="flex border-b">
        {/* Empty space for time labels column */}
        <div className="w-16 flex-shrink-0 border-r" />
        {/* Day headers */}
        <div className="flex flex-1">
          {dayColumns.map(column => (
            <div
              key={`header-${column.date.toString()}`}
              className={`flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0 ${
                column.isToday ? "bg-primary/10" : ""
              }`}
            >
              <span className="text-muted-foreground text-xs">
                {column.dayOfWeek}
              </span>
              <span
                className={`text-sm font-medium ${
                  column.isToday
                    ? "bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full"
                    : ""
                }`}
              >
                {column.dayNumber}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Time labels column */}
        <div className="w-16 flex-shrink-0 border-r">
          {/* Hour labels */}
          <div
            className="bg-muted/30 relative pt-2"
            style={{ height: gridHeight }}
          >
            {hourLabels.map(({ hour, label }) => (
              <div
                key={hour}
                className="text-muted-foreground absolute right-2 text-xs"
                style={{ top: (hour - dayStartHour) * hourHeight }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Days grid */}
        <div className="flex flex-1">
          {dayColumns.map(column => (
            <DayColumnComponent
              key={column.date.toString()}
              column={column}
              hourHeight={hourHeight}
              gridHeight={gridHeight}
              dayStartHour={dayStartHour}
              dayEndHour={dayEndHour}
              currentTimePosition={column.isToday ? currentTimePosition : null}
              onEventClick={onEventClick}
              renderEvent={renderEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DayColumnProps {
  column: DayColumn;
  hourHeight: number;
  gridHeight: number;
  dayStartHour: number;
  dayEndHour: number;
  currentTimePosition: number | null;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
}

function DayColumnComponent({
  column,
  hourHeight,
  gridHeight,
  dayStartHour,
  dayEndHour,
  currentTimePosition,
  onEventClick,
  renderEvent,
}: DayColumnProps) {
  const totalHours = dayEndHour - dayStartHour + 1;

  return (
    <div
      className="relative flex-1 border-r last:border-r-0"
      style={{ height: gridHeight }}
    >
      {/* Hour grid lines */}
      {Array.from({ length: totalHours }, (_, i) => (
        <div
          key={i}
          className="border-border/50 absolute right-0 left-0 border-b"
          style={{ top: i * hourHeight }}
        />
      ))}

      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div
          className="absolute right-0 left-0 z-20 flex items-center"
          style={{ top: `${currentTimePosition}%` }}
        >
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-[2px] flex-1 bg-red-500" />
        </div>
      )}

      {/* Events */}
      <div className="absolute inset-0">
        {column.events.map(event => (
          <EventBlock
            key={event.id}
            event={event}
            onClick={onEventClick}
            renderEvent={renderEvent}
          />
        ))}
      </div>
    </div>
  );
}

interface EventBlockProps {
  event: PositionedEvent;
  onClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
}

function EventBlock({ event, onClick, renderEvent }: EventBlockProps) {
  const handleClick = () => {
    onClick?.(event);
  };

  const defaultBackgroundColor = "bg-blue-200 border-l-blue-500";
  const backgroundClasses = event.backgroundColour || defaultBackgroundColor;

  return (
    <div
      className="absolute z-10 cursor-pointer overflow-hidden px-0.5"
      style={{
        top: `${event.top}%`,
        height: `${event.height}%`,
        left: `${event.left}%`,
        width: `${event.width}%`,
      }}
      onClick={handleClick}
    >
      {renderEvent ? (
        renderEvent(event)
      ) : (
        <div
          className={`h-full rounded-sm border-l-4 p-1 text-xs ${backgroundClasses}`}
        >
          <p className="truncate font-semibold">{event.title}</p>
          <p className="truncate text-[10px]">
            {formatTime(event.start)} - {formatTime(event.end)}
          </p>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;
