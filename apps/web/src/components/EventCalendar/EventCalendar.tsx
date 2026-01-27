"use client";

import { Temporal } from "temporal-polyfill";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import {
  getWeekStart,
  getToday,
  buildDayColumns,
  generateHourLabels,
  getCurrentTimePosition,
  formatWeekRange,
} from "./utils";
import { DayColumnComponent } from "./DayColumn";
import { EventCalendarProps, DayColumn } from "./types";
import { SlidingContainer } from "./SlidingContainer";
import { DayHeader } from "./DayHeader";

const DEFAULT_TIMEZONE = "America/Toronto";
const DEFAULT_DAY_START = 7;
const DEFAULT_DAY_END = 22;
const DEFAULT_HOUR_HEIGHT = 38;
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

  const visibleDays = isDesktop ? (weekendsHidden ? 5 : 7) : isTablet ? 3 : 2;
  const navigationDays = isDesktop ? 7 : visibleDays;

  // Navigation handler for swipe
  const handleSwipeNavigation = useCallback(
    (direction: "next" | "previous") => {
      const newDate =
        direction === "next"
          ? currentDate.add({ days: navigationDays })
          : currentDate.subtract({ days: navigationDays });
      setCurrentDate(newDate);
      onDateChange?.(newDate);
    },
    [currentDate, navigationDays, onDateChange],
  );

  // Swipe gesture handling
  const { dragOffset, isDragging, isAnimating, containerWidthRef, handlers } =
    useSwipeNavigation(handleSwipeNavigation, !isDesktop);

  // Calculate week start from current date
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  const dayColumns = useMemo(() => {
    if (isDesktop) {
      return buildDayColumns(
        events,
        weekStart,
        timezone,
        dayStartHour,
        dayEndHour,
        weekendsHidden,
      );
    }

    return buildDayColumns(
      events,
      currentDate,
      timezone,
      dayStartHour,
      dayEndHour,
      false,
      visibleDays,
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

  const nextDayColumns = useMemo(() => {
    if (isDesktop) return null;
    const nextDate = currentDate.add({ days: visibleDays });
    return buildDayColumns(
      events,
      nextDate,
      timezone,
      dayStartHour,
      dayEndHour,
      false,
      visibleDays,
    );
  }, [
    currentDate,
    events,
    timezone,
    dayStartHour,
    dayEndHour,
    visibleDays,
    isDesktop,
  ]);

  const prevDayColumns = useMemo(() => {
    if (isDesktop) return null;
    const prevDate = currentDate.subtract({ days: visibleDays });
    return buildDayColumns(
      events,
      prevDate,
      timezone,
      dayStartHour,
      dayEndHour,
      false,
      visibleDays,
    );
  }, [
    currentDate,
    events,
    timezone,
    dayStartHour,
    dayEndHour,
    visibleDays,
    isDesktop,
  ]);

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
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timezone, dayStartHour, dayEndHour, showCurrentTime]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (isAnimating) return;
    const newDate = currentDate.subtract({ days: navigationDays });
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [isAnimating, currentDate, navigationDays, onDateChange]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    const newDate = currentDate.add({ days: navigationDays });
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [isAnimating, currentDate, navigationDays, onDateChange]);

  const goToToday = useCallback(() => {
    const today = getToday(timezone);
    setCurrentDate(today);
    onDateChange?.(today);
  }, [timezone, onDateChange]);

  const totalHours = dayEndHour - dayStartHour + 1;
  const paddingHeight = hourHeight;
  const gridHeight = totalHours * hourHeight + paddingHeight;

  // Helper: Render sliding columns
  const renderSlidingColumns = (
    columns: DayColumn[] | null,
    offset: number,
    keyPrefix: string,
    renderContent: (column: DayColumn) => React.ReactNode,
  ) =>
    columns &&
    (isDragging || isAnimating) && (
      <SlidingContainer
        offset={offset}
        isAnimating={isAnimating}
        className="absolute top-0 flex w-full"
      >
        {columns.map(column => (
          <div key={`${keyPrefix}-${column.date}`}>{renderContent(column)}</div>
        ))}
      </SlidingContainer>
    );

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <h2 className="text-lg font-semibold">
            {formatWeekRange(weekStart)}
          </h2>
        </div>
        {isDesktop && (
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch
                checked={weekendsHidden}
                onCheckedChange={setWeekendsHidden}
              />
              <span className="text-muted-foreground">Hide weekends</span>
            </label>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Day Headers Row */}
      <div className="flex overflow-hidden border-b">
        <div className="w-16 flex-shrink-0 border-r"></div>
        <div className="relative flex-1 overflow-hidden">
          {/* Previous day headers */}
          {renderSlidingColumns(
            prevDayColumns,
            -(containerWidthRef.current || 0) + dragOffset,
            "header-prev",
            column => (
              <DayHeader column={column} />
            ),
          )}
          {/* Current day headers */}
          <SlidingContainer
            offset={dragOffset}
            isAnimating={isAnimating}
            className="flex w-full"
          >
            {dayColumns.map(column => (
              <DayHeader key={`header-${column.date}`} column={column} />
            ))}
          </SlidingContainer>
          {/* Next day headers */}
          {renderSlidingColumns(
            nextDayColumns,
            (containerWidthRef.current || 0) + dragOffset,
            "header-next",
            column => (
              <DayHeader column={column} />
            ),
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-auto" {...handlers}>
        {/* Time labels column */}
        <div
          className="bg-background sticky left-0 z-30 w-16 flex-shrink-0 border-r"
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

        {/* Days grid container */}
        <div className="relative flex-1">
          {/* Previous days */}
          {renderSlidingColumns(
            prevDayColumns,
            -(containerWidthRef.current || 0) + dragOffset,
            "prev",
            column => (
              <DayColumnComponent
                column={column}
                hourHeight={hourHeight}
                gridHeight={gridHeight}
                paddingHeight={paddingHeight}
                dayStartHour={dayStartHour}
                dayEndHour={dayEndHour}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
                onEventClick={onEventClick}
                renderEvent={renderEvent}
              />
            ),
          )}
          {/* Current days */}
          <SlidingContainer
            offset={dragOffset}
            isAnimating={isAnimating}
            className="flex w-full"
            style={{ height: gridHeight }}
          >
            {dayColumns.map(column => (
              <DayColumnComponent
                key={column.date.toString()}
                column={column}
                hourHeight={hourHeight}
                gridHeight={gridHeight}
                paddingHeight={paddingHeight}
                dayStartHour={dayStartHour}
                dayEndHour={dayEndHour}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
                onEventClick={onEventClick}
                renderEvent={renderEvent}
              />
            ))}
          </SlidingContainer>
          {/* Next days */}
          {renderSlidingColumns(
            nextDayColumns,
            (containerWidthRef.current || 0) + dragOffset,
            "next",
            column => (
              <DayColumnComponent
                column={column}
                hourHeight={hourHeight}
                gridHeight={gridHeight}
                paddingHeight={paddingHeight}
                dayStartHour={dayStartHour}
                dayEndHour={dayEndHour}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
                onEventClick={onEventClick}
                renderEvent={renderEvent}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
