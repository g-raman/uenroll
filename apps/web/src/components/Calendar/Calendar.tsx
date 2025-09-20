"use client";

import "temporal-polyfill/global";

import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createViewMonthAgenda, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "@schedule-x/theme-shadcn/dist/index.css";
import { useEffect, useState } from "react";
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import CalendarEvent from "./CalendarEvent/CalendarEvent";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import CalendarEventModal from "./CalendarEventModal/CalendarEventModal";
import { useTheme } from "next-themes";
import { useTermParam } from "@/hooks/useTermParam";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { createCalendarAppEvents } from "@/utils/calendarEvents";
import { useDataParam } from "@/hooks/useDataParam";
import { TIMEZONE } from "@/utils/constants";

function Calendar() {
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});
  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const events = createCalendarAppEvents(courseSearchResults, data);

  const [eventsService] = useState(() => createEventsServicePlugin());
  const [eventRecurrence] = useState(() => createEventRecurrencePlugin());
  const [eventModal] = useState(() => createEventModalPlugin());
  const [calendarControls] = useState(() => createCalendarControlsPlugin());
  const plugins = [
    eventsService,
    eventRecurrence,
    calendarControls,
    eventModal,
  ];
  const { theme, systemTheme } = useTheme();

  const calendar = useNextCalendarApp(
    {
      timezone: TIMEZONE,
      views: [createViewWeek(), createViewMonthAgenda()],
      theme: "shadcn",
      isDark: theme === "dark" || systemTheme === "dark",
      dayBoundaries: {
        start: "06:00",
        end: "23:00",
      },
      callbacks: {
        onRender: () => {
          // HACK: Calendar UI doesn't affect latest changes unless I do this
          const currentView = calendarControls.getView();
          if (currentView === "week") {
            calendarControls.setView("month-agenda");
            calendarControls.setView("week");
          } else {
            calendarControls.setView("week");
            calendarControls.setView("month-agenda");
          }
        },
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
    switch (selectedTerm) {
      case "2259":
        calendarControls.setDate(Temporal.PlainDate.from("2025-09-03"));
        break;
      case "2261":
        calendarControls.setDate(Temporal.PlainDate.from("2026-01-12"));
        break;
    }
  }, [calendarControls, selectedTerm]);

  useEffect(() => {
    if (!calendar) return;

    const newTheme = theme === "system" ? systemTheme : theme;
    calendar.setTheme(newTheme as "dark" | "light");
  }, [theme, systemTheme, calendar]);

  if (!selectedTerm || !calendar || !eventsService) return null;
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
