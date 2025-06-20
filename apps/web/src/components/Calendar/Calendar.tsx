"use client";

import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createViewMonthAgenda, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "@schedule-x/theme-shadcn/dist/index.css";
import { useEffect, useState } from "react";
import { useSearchResults } from "@/contexts/SearchResultsContext";
import dayjs from "dayjs";
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { datetime, RRule } from "rrule";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import CalendarEvent from "./CalendarEvent/CalendarEvent";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import CalendarEventModal from "./CalendarEventModal/CalendarEventModal";
import { useTheme } from "next-themes";

const DATE_FORMAT = "YYYY-MM-DD";
function Calendar() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const eventRecurrence = useState(() => createEventRecurrencePlugin())[0];
  const eventModal = useState(() => createEventModalPlugin())[0];
  const calendarControls = useState(() => createCalendarControlsPlugin())[0];
  const plugins = [
    eventsService,
    eventRecurrence,
    calendarControls,
    eventModal,
  ];
  const { state } = useSearchResults();
  const { theme, systemTheme } = useTheme();

  const calendar = useNextCalendarApp(
    {
      views: [createViewWeek(), createViewMonthAgenda()],
      theme: "shadcn",
      isDark: theme === "dark" || systemTheme === "dark",
      dayBoundaries: {
        start: "06:00",
        end: "23:00",
      },
      callbacks: {
        beforeRender($app) {
          // Need a multiplier to reduce grid height as some space
          // is taken up by the calendar navigation
          const multiplier = 0.735;
          const height = window.innerHeight * multiplier;
          $app.config.weekOptions.value.gridHeight = height;
        },
      },
    },
    plugins,
  );

  // HACK: Gotta figure out a better way to do This
  // Hardcoding for now
  useEffect(() => {
    if (!state.term) return;

    switch (state.term.term) {
      case "2025 Spring/Summer Term":
        calendarControls.setDate("2025-05-05");
        break;
      case "2025 Fall Term":
        calendarControls.setDate("2025-09-03");
        break;
      case "2026 Winter Term":
        calendarControls.setDate("2026-01-12");
        break;
    }
  }, [calendarControls, state.term]);

  useEffect(() => {
    if (!calendar) return;

    const newTheme = theme === "system" ? systemTheme : theme;
    calendar.setTheme(newTheme as "dark" | "light");
  }, [theme, systemTheme, calendar]);

  if (!state.term || !calendar || !eventsService) return null;

  const events = state.selectedSessions
    .filter(session => session.dayOfWeek > -1)
    .map(session => {
      const baseStartDate = dayjs(session.startRecur);
      const dayOffset = session.dayOfWeek - baseStartDate.day();
      const startDate = baseStartDate.add(
        dayOffset < 0 ? 7 + dayOffset : dayOffset,
        "days",
      );
      const endDate = dayjs(session.endRecur);

      const rrule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: datetime(
          startDate.get("year"),
          startDate.get("month") + 1,
          startDate.get("day"),
        ),
        until: datetime(
          endDate.get("year"),
          endDate.get("month") + 1,
          endDate.get("day"),
        ),
      });

      return {
        id: `${session.courseDetails.courseCode}${session.courseDetails.subSection}`,
        title: `${session.courseDetails.courseCode}`,
        start: `${startDate.format(DATE_FORMAT)} ${session.startTime}`,
        end: `${startDate.format(DATE_FORMAT)} ${session.endTime}`,
        rrule: rrule.toString(),
        ...session.courseDetails,
      };
    });

  eventsService.set(events);

  return (
    <div className="h-full overflow-scroll">
      <ScheduleXCalendar
        calendarApp={calendar}
        customComponents={{
          timeGridEvent: CalendarEvent,
          monthAgendaEvent: CalendarEvent,
          eventModal: CalendarEventModal,
        }}
      />
    </div>
  );
}

export default Calendar;
