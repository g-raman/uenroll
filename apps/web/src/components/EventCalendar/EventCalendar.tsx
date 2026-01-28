"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { EventCalendarProps, DayColumn } from "./types";
import {
  DEFAULT_TIMEZONE,
  DEFAULT_DAY_START,
  DEFAULT_DAY_END,
  DEFAULT_HOUR_HEIGHT,
  TABLET_BREAKPOINT,
} from "./constants";
import {
  getToday,
  generateHourLabels,
  getCurrentTimePosition,
} from "./dateUtils";
import { getDesktopAnimationClass } from "./animation";
import { CalendarHeader } from "./CalendarHeader";
import { TimeColumn } from "./TimeColumn";
import { DayHeader } from "./DayHeader";
import { DayColumnComponent } from "./DayColumn";
import { SlidingContainer } from "./SlidingContainer";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";

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
  const isDesktop = width !== null && width >= TABLET_BREAKPOINT;

  const [weekendsHidden, setWeekendsHidden] = useState(hideWeekends);
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(
    null,
  );

  const {
    weekStart,
    animationState,
    dayColumns,
    prevDayColumns,
    nextDayColumns,
    setCurrentDate,
    navigateDesktop,
    swipe,
  } = useCalendarNavigation({
    events,
    initialDate: initialDate ?? getToday(timezone),
    timezone,
    dayStartHour,
    dayEndHour,
    weekendsHidden,
  });

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
    // Update current time position every minute
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone, dayStartHour, dayEndHour, showCurrentTime]);

  const goToTermStart = useCallback(() => {
    setCurrentDate(termStart);
  }, [termStart, setCurrentDate]);

  // Grid dimensions
  const totalHours = dayEndHour - dayStartHour + 1;
  const paddingHeight = hourHeight;
  const gridHeight = totalHours * hourHeight + paddingHeight;

  const dayColumnProps = {
    hourHeight,
    gridHeight,
    paddingHeight,
    dayStartHour,
    dayEndHour,
    popoverDisabled: !isDesktop,
  };

  // Helper to render sliding columns (prev/next) during swipe
  const renderSlidingColumns = (
    columns: DayColumn[] | null,
    offset: number,
    keyPrefix: string,
    renderContent: (column: DayColumn, key: string) => React.ReactNode,
  ) =>
    columns &&
    (swipe.isDragging || swipe.isAnimating) && (
      <SlidingContainer
        offset={offset}
        isAnimating={swipe.isAnimating}
        className="absolute top-0 flex w-full"
      >
        {columns.map(column =>
          renderContent(column, `${keyPrefix}-${column.date}`),
        )}
      </SlidingContainer>
    );

  return (
    <div className="bg-background flex flex-col rounded-lg border sm:h-full sm:overflow-hidden">
      <CalendarHeader
        weekStart={weekStart}
        weekendsHidden={weekendsHidden}
        onWeekendsHiddenChange={setWeekendsHidden}
        onNavigate={navigateDesktop}
        onGoToTermStart={goToTermStart}
      />

      {/* Day Headers Row */}
      <div className="flex border-b">
        <div className="w-16 flex-shrink-0 border-r" />
        <div className="relative flex-1 overflow-hidden">
          {renderSlidingColumns(
            prevDayColumns,
            swipe.prevOffset,
            "header-prev",
            (column, key) => (
              <DayHeader key={key} column={column} />
            ),
          )}
          <SlidingContainer
            offset={swipe.dragOffset}
            isAnimating={swipe.isAnimating}
            className={`flex w-full ${getDesktopAnimationClass(animationState)}`}
          >
            {dayColumns.map(column => (
              <DayHeader key={`header-${column.date}`} column={column} />
            ))}
          </SlidingContainer>
          {renderSlidingColumns(
            nextDayColumns,
            swipe.nextOffset,
            "header-next",
            (column, key) => (
              <DayHeader key={key} column={column} />
            ),
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex sm:min-h-0 sm:flex-1 sm:overflow-auto"
        {...swipe.handlers}
      >
        <TimeColumn
          hourLabels={hourLabels}
          gridHeight={gridHeight}
          paddingHeight={paddingHeight}
          hourHeight={hourHeight}
          dayStartHour={dayStartHour}
        />

        {/* Days grid container */}
        <div className="relative flex-1 overflow-x-clip">
          {renderSlidingColumns(
            prevDayColumns,
            swipe.prevOffset,
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
            offset={swipe.dragOffset}
            isAnimating={swipe.isAnimating}
            className={`flex w-full ${getDesktopAnimationClass(animationState)}`}
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
            swipe.nextOffset,
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
