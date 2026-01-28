import { useState, useCallback, useMemo } from "react";
import { Temporal } from "temporal-polyfill";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from "./constants";
import { getWeekStart } from "./dateUtils";
import { buildDayColumns } from "./buildDayColumns";
import { CalendarEvent, DayColumn } from "./types";

type AnimationState =
  | "idle"
  | "slide-out-left"
  | "slide-out-right"
  | "slide-in-left"
  | "slide-in-right";

interface UseCalendarNavigationOptions {
  events: CalendarEvent[];
  initialDate: Temporal.PlainDate;
  timezone: string;
  dayStartHour: number;
  dayEndHour: number;
  weekendsHidden: boolean;
}

export function useCalendarNavigation({
  events,
  initialDate,
  timezone,
  dayStartHour,
  dayEndHour,
  weekendsHidden,
}: UseCalendarNavigationOptions) {
  const { width } = useScreenSize();
  const [currentDate, setCurrentDate] =
    useState<Temporal.PlainDate>(initialDate);
  const [animationState, setAnimationState] = useState<AnimationState>("idle");

  const isDesktop = width !== null && width >= TABLET_BREAKPOINT;
  const isTablet =
    width !== null && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  const visibleDays = isDesktop ? (weekendsHidden ? 5 : 7) : isTablet ? 3 : 2;
  const navigationDays = isDesktop ? 7 : visibleDays;

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Handle navigation (called by swipe or button click)
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

  // Swipe navigation (only enabled on mobile/tablet)
  const swipe = useSwipeNavigation(handleSwipeNavigation, !isDesktop);

  // Desktop navigation with animation
  const navigateDesktop = useCallback(
    (direction: "next" | "previous") => {
      if (swipe.isAnimating || animationState !== "idle") return;

      // Phase 1: Slide out
      setAnimationState(
        direction === "next" ? "slide-out-left" : "slide-out-right",
      );

      // Phase 2: Update content and slide in
      setTimeout(() => {
        handleSwipeNavigation(direction);
        setAnimationState(
          direction === "next" ? "slide-in-right" : "slide-in-left",
        );

        // Phase 3: Reset to idle
        setTimeout(() => {
          setAnimationState("idle");
        }, 150);
      }, 150);
    },
    [swipe.isAnimating, animationState, handleSwipeNavigation],
  );

  // Build day columns for current view
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

  // Build adjacent day columns for swipe preview (mobile/tablet only)
  const getAdjacentDayColumns = useCallback(
    (daysOffset: number): DayColumn[] | null => {
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

  return {
    // State
    currentDate,
    weekStart,
    animationState,
    dayColumns,
    prevDayColumns,
    nextDayColumns,

    // Actions
    setCurrentDate,
    navigateDesktop,

    // Swipe state and handlers
    swipe,

    // Derived values
    isDesktop,
    visibleDays,
  };
}
