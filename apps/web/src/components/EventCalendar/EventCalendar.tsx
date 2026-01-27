"use client";

import { Temporal } from "temporal-polyfill";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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

// Touch/swipe gesture configuration
const SWIPE_COMMIT_THRESHOLD = 0.3; // Percentage of width to commit navigation
const SWIPE_VELOCITY_THRESHOLD = 0.5; // Velocity (px/ms) to commit navigation
const ANIMATION_DURATION = 200; // Animation duration in ms

const DEFAULT_TIMEZONE = "America/Toronto";
const DEFAULT_DAY_START = 7;
const DEFAULT_DAY_END = 22;
const DEFAULT_HOUR_HEIGHT = 38;

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

  // Swipe/drag state for interactive sliding
  // dragOffset: current drag position in pixels (negative = dragging left, positive = dragging right)
  // isDragging: whether user is currently touching/dragging
  // isAnimating: whether we're animating to final position after release
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerWidthRef = useRef(0);

  // Determine view mode based on screen size
  const isDesktop = width !== null && width >= TABLET_BREAKPOINT;
  const isTablet =
    width !== null && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

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

  // Build day columns for next and previous dates (for swipe preview)
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
  const paddingHeight = hourHeight; // Full cell padding above
  const gridHeight = totalHours * hourHeight + paddingHeight;

  // Touch/swipe gesture handling for mobile and tablet
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    lastX: number;
    lastTime: number;
    isHorizontal: boolean | null;
  } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      const touch = e.touches[0];
      if (!touch) return;

      // Store the container width for percentage calculations
      const container = e.currentTarget;
      containerWidthRef.current = container.getBoundingClientRect().width - 64; // Subtract time column width

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        lastX: touch.clientX,
        lastTime: Date.now(),
        isHorizontal: null, // Will be determined on first move
      };
    },
    [isAnimating],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || isAnimating) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine scroll direction on first significant move
      if (touchStartRef.current.isHorizontal === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX > 10 || absY > 10) {
          touchStartRef.current.isHorizontal = absX > absY;
        }
      }

      // Only handle horizontal swipes
      if (touchStartRef.current.isHorizontal) {
        setIsDragging(true);
        setDragOffset(deltaX);

        // Update velocity tracking
        touchStartRef.current.lastX = touch.clientX;
        touchStartRef.current.lastTime = Date.now();
      }
    },
    [isAnimating],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !isDragging) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      const containerWidth = containerWidthRef.current || 300;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = Date.now() - touchStartRef.current.lastTime;
      const velocityX =
        (touch.clientX - touchStartRef.current.lastX) / Math.max(deltaTime, 1);

      // Calculate percentage of container width dragged
      const dragPercentage = Math.abs(deltaX) / containerWidth;

      // Determine if we should commit the navigation
      const shouldCommit =
        dragPercentage > SWIPE_COMMIT_THRESHOLD ||
        Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldCommit) {
        // Animate to complete position and update date
        setIsAnimating(true);
        const direction = deltaX > 0 ? "previous" : "next";
        const targetOffset =
          direction === "next" ? -containerWidth : containerWidth;

        setDragOffset(targetOffset);

        setTimeout(() => {
          // Update the date
          const newDate =
            direction === "next"
              ? currentDate.add({ days: navigationDays })
              : currentDate.subtract({ days: navigationDays });
          setCurrentDate(newDate);
          onDateChange?.(newDate);

          // Reset state
          setDragOffset(0);
          setIsDragging(false);
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      } else {
        // Animate back to original position
        setIsAnimating(true);
        setDragOffset(0);

        setTimeout(() => {
          setIsDragging(false);
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      }

      touchStartRef.current = null;
    },
    [isDragging, currentDate, navigationDays, onDateChange],
  );

  // Only enable swipe on mobile and tablet
  const swipeEnabled = !isDesktop;

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
        {/* Empty space for time labels column */}
        <div className="w-16 flex-shrink-0 border-r" />
        {/* Day headers container - slides during swipe */}
        <div className="relative flex-1 overflow-hidden">
          {/* Previous day headers (shown when dragging right) */}
          {prevDayColumns && (isDragging || isAnimating) && (
            <div
              className="absolute top-0 flex w-full"
              style={{
                transitionProperty: isAnimating ? "transform" : "none",
                transitionDuration: isAnimating
                  ? `${ANIMATION_DURATION}ms`
                  : "0ms",
                transitionTimingFunction: "ease-out",
                transform: `translateX(calc(-100% + ${dragOffset}px))`,
              }}
            >
              {prevDayColumns.map(column => (
                <div
                  key={`header-prev-${column.date.toString()}`}
                  className={`flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0 ${
                    column.isToday ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-muted-foreground text-xs">
                    {column.dayOfWeek}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center text-sm font-medium ${
                      column.isToday
                        ? "bg-primary text-primary-foreground rounded-full"
                        : ""
                    }`}
                  >
                    {column.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Current day headers */}
          <div
            className="flex w-full"
            style={{
              transitionProperty: isAnimating ? "transform" : "none",
              transitionDuration: isAnimating
                ? `${ANIMATION_DURATION}ms`
                : "0ms",
              transitionTimingFunction: "ease-out",
              transform:
                isDragging || isAnimating
                  ? `translateX(${dragOffset}px)`
                  : "translateX(0)",
            }}
          >
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
                  className={`flex h-6 w-6 items-center justify-center text-sm font-medium ${
                    column.isToday
                      ? "bg-primary text-primary-foreground rounded-full"
                      : ""
                  }`}
                >
                  {column.dayNumber}
                </span>
              </div>
            ))}
          </div>
          {/* Next day headers (shown when dragging left) */}
          {nextDayColumns && (isDragging || isAnimating) && (
            <div
              className="absolute top-0 flex w-full"
              style={{
                transitionProperty: isAnimating ? "transform" : "none",
                transitionDuration: isAnimating
                  ? `${ANIMATION_DURATION}ms`
                  : "0ms",
                transitionTimingFunction: "ease-out",
                transform: `translateX(calc(100% + ${dragOffset}px))`,
              }}
            >
              {nextDayColumns.map(column => (
                <div
                  key={`header-next-${column.date.toString()}`}
                  className={`flex flex-1 flex-col items-center justify-center border-r py-2 last:border-r-0 ${
                    column.isToday ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-muted-foreground text-xs">
                    {column.dayOfWeek}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center text-sm font-medium ${
                      column.isToday
                        ? "bg-primary text-primary-foreground rounded-full"
                        : ""
                    }`}
                  >
                    {column.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex flex-1 overflow-auto"
        onTouchStart={swipeEnabled ? handleTouchStart : undefined}
        onTouchMove={swipeEnabled ? handleTouchMove : undefined}
        onTouchEnd={swipeEnabled ? handleTouchEnd : undefined}
      >
        {/* Time labels column */}
        <div
          className="bg-background sticky left-0 z-30 w-16 flex-shrink-0 border-r"
          style={{ height: gridHeight }}
        >
          {/* Hour labels */}
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

        {/* Days grid container - slides during swipe */}
        <div className="relative flex-1">
          {/* Previous days (shown when dragging right) */}
          {prevDayColumns && (isDragging || isAnimating) && (
            <div
              className="absolute top-0 flex w-full"
              style={{
                height: gridHeight,
                transitionProperty: isAnimating ? "transform" : "none",
                transitionDuration: isAnimating
                  ? `${ANIMATION_DURATION}ms`
                  : "0ms",
                transitionTimingFunction: "ease-out",
                transform: `translateX(calc(-100% + ${dragOffset}px))`,
              }}
            >
              {prevDayColumns.map(column => (
                <DayColumnComponent
                  key={`prev-${column.date.toString()}`}
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
            </div>
          )}
          {/* Current days */}
          <div
            className="flex w-full"
            style={{
              height: gridHeight,
              transitionProperty: isAnimating ? "transform" : "none",
              transitionDuration: isAnimating
                ? `${ANIMATION_DURATION}ms`
                : "0ms",
              transitionTimingFunction: "ease-out",
              transform:
                isDragging || isAnimating
                  ? `translateX(${dragOffset}px)`
                  : "translateX(0)",
            }}
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
          </div>
          {/* Next days (shown when dragging left) */}
          {nextDayColumns && (isDragging || isAnimating) && (
            <div
              className="absolute top-0 flex w-full"
              style={{
                height: gridHeight,
                transitionProperty: isAnimating ? "transform" : "none",
                transitionDuration: isAnimating
                  ? `${ANIMATION_DURATION}ms`
                  : "0ms",
                transitionTimingFunction: "ease-out",
                transform: `translateX(calc(100% + ${dragOffset}px))`,
              }}
            >
              {nextDayColumns.map(column => (
                <DayColumnComponent
                  key={`next-${column.date.toString()}`}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DayColumnProps {
  column: DayColumn;
  hourHeight: number;
  gridHeight: number;
  paddingHeight: number;
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
  paddingHeight,
  dayStartHour,
  dayEndHour,
  currentTimePosition,
  onEventClick,
  renderEvent,
}: DayColumnProps) {
  const totalHours = dayEndHour - dayStartHour + 1;
  const contentHeight = totalHours * hourHeight;

  return (
    <div
      className="relative flex-1 border-r last:border-r-0"
      style={{ height: gridHeight }}
    >
      {/* Hour grid lines - offset by padding */}
      {Array.from({ length: totalHours + 1 }, (_, i) => (
        <div
          key={i}
          className="border-border/50 absolute right-0 left-0 border-b"
          style={{ top: paddingHeight + i * hourHeight }}
        />
      ))}

      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div
          className="pointer-events-none absolute right-0 left-0 flex items-center"
          style={{
            top: paddingHeight + (currentTimePosition / 100) * contentHeight,
          }}
        >
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-[2px] flex-1 bg-red-500" />
        </div>
      )}

      {/* Events container - offset by padding */}
      <div
        className="absolute right-0 left-0"
        style={{ top: paddingHeight, height: contentHeight }}
      >
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

  // Extract additional event data
  const subSection = event.subSection as string | undefined;
  const type = event.type as string | undefined;

  return (
    <div
      className="absolute cursor-pointer overflow-hidden px-0.5"
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
          className={`h-full space-y-1 rounded-md border-l-4 px-1 py-2 text-xs ${backgroundClasses}`}
        >
          <p className="truncate leading-tight">
            <span className="font-semibold">{event.title}</span>&nbsp;
            <span className="font-normal">
              - {subSection} ({type})
            </span>
          </p>

          <p className="truncate leading-tight font-light">
            {formatTime(event.start)} - {formatTime(event.end)}
          </p>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;
