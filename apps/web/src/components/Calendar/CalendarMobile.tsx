"use client";

import "@schedule-x/theme-shadcn/dist/index.css";

import { useTermParam } from "@/hooks/useTermParam";
import { TIMEZONE } from "@/utils/constants";
import { coursesToCalendarAppEvents } from "@/utils/mappers/calendar";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import CalendarEvent from "@/components/Calendar/CalendarEvent/CalendarEvent";
import CalendarEventModal from "@/components/Calendar/CalendarEventModal/CalendarEventModal";
import CalendarHeader from "@/components/Calendar/CalendarHeader/CalendarHeader";
import { createViewList, createViewWeek } from "@schedule-x/calendar";

interface CalendarMobileProps {
  events: ReturnType<typeof coursesToCalendarAppEvents>;
}

export function CalendarMobile({ events }: CalendarMobileProps) {
  const [selectedTerm] = useTermParam();

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
      views: [createViewWeek(), createViewList()],
      theme: "shadcn",
      isResponsive: false,
      isDark: theme === "dark" || systemTheme === "dark",
      weekOptions: {
        nDays: 3,
      },
      dayBoundaries: {
        start: "06:00",
        end: "23:00",
      },
      events,
      callbacks: {
        beforeRender($app) {
          // Need a multiplier to reduce grid height as some space
          // is taken up by the calendar navigation
          const multiplier = 0.66;
          const height = window.innerHeight * multiplier;
          $app.config.weekOptions.value.gridHeight = height;
        },
      },
    },
    plugins,
  );
  eventModal.close();

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

  if (!calendar) return;
  eventsService.set(events);
  events.sort((first, second) =>
    Temporal.ZonedDateTime.compare(first.start, second.start),
  );

  // HACK: Events don't update otherwise
  const view = calendarControls.getView();
  if (view === "list") {
    calendarControls.setView("week");
    calendarControls.setView("list");
  } else {
    calendarControls.setView("list");
    calendarControls.setView("week");
  }

  const latestStartingEvent = events.at(-1);
  if (latestStartingEvent)
    calendarControls.setDate(latestStartingEvent.start.toPlainDate());

  return (
    <ScheduleXCalendar
      calendarApp={calendar}
      customComponents={{
        timeGridEvent: CalendarEvent,
        monthAgendaEvent: CalendarEvent,
        eventModal: CalendarEventModal,
        headerContent: ({ $app }) => CalendarHeader({ $app, delta: 2 }),
      }}
    />
  );
}
