"use client";

import { Temporal } from "temporal-polyfill";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/components/button";
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
import DownloadCalendarButton from "../Buttons/DownloadCalendarButton/DownloadCalendarButton";
import { CopyLinkButton } from "../Buttons/CopyLinkButton/CopyLinkButton";
import { Switch } from "@repo/ui/components/switch";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_TIMEZONE = "America/Toronto";
const DEFAULT_DAY_START = 7;
const DEFAULT_DAY_END = 22;
const DEFAULT_HOUR_HEIGHT = 38;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

export function EventCalendar({ events, config }: EventCalendarProps) {
  const {
    termStart,
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

  const isDesktop = width !== null && width >= TABLET_BREAKPOINT;
  const isTablet =
    width !== null && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  const visibleDays = isDesktop ? (weekendsHidden ? 5 : 7) : isTablet ? 3 : 2;
  const navigationDays = isDesktop ? 7 : visibleDays;

  const handleSwipeNavigation = useCallback(
    (direction: "next" | "previous") => {
      const newDate =
        direction === "next"
          ? currentDate.add({ days: navigationDays })
          : currentDate.subtract({ days: navigationDays });
      setCurrentDate(newDate);
    },
    [currentDate, navigationDays],
  );

  const {
    dragOffset,
    isDragging,
    isAnimating,
    prevOffset,
    nextOffset,
    handlers,
  } = useSwipeNavigation(handleSwipeNavigation, !isDesktop);

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

  const getAdjacentDayColumns = useCallback(
    (daysOffset: number) => {
      if (isDesktop) return null;
      const targetDate = currentDate.add({ days: daysOffset });
      return buildDayColumns(
        events,
        targetDate,
        timezone,
        dayStartHour,
        dayEndHour,
        false,
        visibleDays,
      );
    },
    [
      currentDate,
      events,
      timezone,
      dayStartHour,
      dayEndHour,
      visibleDays,
      isDesktop,
    ],
  );

  const nextDayColumns = useMemo(
    () => getAdjacentDayColumns(visibleDays),
    [getAdjacentDayColumns, visibleDays],
  );

  const prevDayColumns = useMemo(
    () => getAdjacentDayColumns(-visibleDays),
    [getAdjacentDayColumns, visibleDays],
  );

  const hourLabels = useMemo(
    () => generateHourLabels(dayStartHour, dayEndHour),
    [dayStartHour, dayEndHour],
  );

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

  const navigate = useCallback(
    (direction: "next" | "previous") => {
      if (isAnimating) return;
      handleSwipeNavigation(direction);
    },
    [isAnimating, handleSwipeNavigation],
  );

  const goToTermStart = useCallback(() => {
    setCurrentDate(termStart);
  }, [termStart]);

  const totalHours = dayEndHour - dayStartHour + 1;
  const paddingHeight = hourHeight;
  const gridHeight = totalHours * hourHeight + paddingHeight;

  const dayColumnProps = {
    hourHeight,
    gridHeight,
    paddingHeight,
    dayStartHour,
    dayEndHour,
  };

  const renderSlidingColumns = (
    columns: DayColumn[] | null,
    offset: number,
    keyPrefix: string,
    renderContent: (column: DayColumn, key: string) => React.ReactNode,
  ) =>
    columns &&
    (isDragging || isAnimating) && (
      <SlidingContainer
        offset={offset}
        isAnimating={isAnimating}
        className="absolute top-0 flex w-full"
      >
        {columns.map(column =>
          renderContent(column, `${keyPrefix}-${column.date}`),
        )}
      </SlidingContainer>
    );

  // On mobile, don't constrain height - let page scroll naturally
  const isMobile = width !== null && width < MOBILE_BREAKPOINT;

  return (
    <div
      className={`bg-background flex flex-col rounded-lg border ${
        isMobile ? "" : "h-full overflow-hidden"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToTermStart}>
            Term Start
          </Button>
          <h2 className="text-base font-semibold">
            {formatWeekRange(weekStart)}
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isDesktop && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch
                checked={weekendsHidden}
                onCheckedChange={setWeekendsHidden}
              />
              <span className="text-muted-foreground">Hide weekends</span>
            </label>
          )}

          <div className="flex gap-2">
            <DownloadCalendarButton />
            <CopyLinkButton />
          </div>

          {isDesktop && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("previous")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Day Headers Row */}
      <div className="flex border-b">
        {/* Empty space for time labels column */}
        <div className="w-16 flex-shrink-0 border-r" />
        {/* Day headers container */}
        <div className="relative flex-1 overflow-hidden">
          {renderSlidingColumns(
            prevDayColumns,
            prevOffset,
            "header-prev",
            (column, key) => (
              <DayHeader key={key} column={column} />
            ),
          )}
          <SlidingContainer
            offset={dragOffset}
            isAnimating={isAnimating}
            className="flex w-full"
          >
            {dayColumns.map(column => (
              <DayHeader key={`header-${column.date}`} column={column} />
            ))}
          </SlidingContainer>
          {renderSlidingColumns(
            nextDayColumns,
            nextOffset,
            "header-next",
            (column, key) => (
              <DayHeader key={key} column={column} />
            ),
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className={`flex ${isMobile ? "" : "min-h-0 flex-1 overflow-auto"}`}
        {...handlers}
      >
        {/* Time labels column - sticky to left */}
        <div
          className="bg-background sticky left-0 z-10 w-16 flex-shrink-0 border-r"
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
        <div className="relative flex-1 overflow-hidden">
          {renderSlidingColumns(
            prevDayColumns,
            prevOffset,
            "prev",
            (column, key) => (
              <DayColumnComponent
                key={key}
                column={column}
                {...dayColumnProps}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
              />
            ),
          )}
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
                {...dayColumnProps}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
              />
            ))}
          </SlidingContainer>
          {renderSlidingColumns(
            nextDayColumns,
            nextOffset,
            "next",
            (column, key) => (
              <DayColumnComponent
                key={key}
                column={column}
                {...dayColumnProps}
                currentTimePosition={
                  column.isToday ? currentTimePosition : null
                }
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
