"use client";

import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createViewMonthAgenda, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "@schedule-x/theme-shadcn/dist/index.css";
import { useEffect } from "react";
import { useSearchResults } from "@/contexts/SearchResultsContext";
import dayjs from "dayjs";
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { datetime, RRule } from "rrule";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import CalendarEvent from "./CalendarEvent/CalendarEvent";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import CalendarEventModal from "./CalendarEventModal/CalendarEventModal";

const DATE_FORMAT = "YYYY-MM-DD";
function Calendar() {
  const plugins = [
    createEventsServicePlugin(),
    createEventRecurrencePlugin(),
    createCalendarControlsPlugin(),
    createEventModalPlugin(),
  ];
  const { state } = useSearchResults();

  const calendar = useNextCalendarApp(
    {
      views: [createViewWeek(), createViewMonthAgenda()],
      theme: "shadcn",
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

  useEffect(() => {
    if (!calendar) {
      return;
    }

    if (state.selectedSessions.length === 0) {
      // Typescript doesn't pick up the additionaly fields but they exist
      // @ts-expect-error
      calendar.eventsService.set([]);
      return;
    }

    const events = state.selectedSessions.map((session) => {
      const baseStartDate = dayjs(session.startRecur);
      const dayOffset = Math.abs(baseStartDate.get("d") - session.dayOfWeek);
      const startDate = baseStartDate.add(dayOffset, "days");
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
        id:
          `${session.courseDetails.courseCode}${session.courseDetails.subSection}`,
        title: `${session.courseDetails.courseCode}`,
        start: `${startDate.format(DATE_FORMAT)} ${session.startTime}`,
        end: `${startDate.format(DATE_FORMAT)} ${session.endTime}`,
        rrule: rrule.toString(),
        ...session.courseDetails,
      };
    });

    // Typescript doesn't pick up the additionaly fields but they exist
    // @ts-expect-error
    calendar.eventsService.set(events);

    // HACK: This a temporary way to programatically refresh the calendar
    // @ts-ignore
    const currentView = calendar.calendarControls.getView();
    // @ts-ignore
    calendar.calendarControls.setView(
      currentView === "month-agenda" ? "week" : "month-agenda",
    );
    // @ts-ignore
    calendar.calendarControls.setView(
      currentView === "month-agenda" ? "month-agenda" : "week",
    );
  }, [calendar, state.selectedSessions]);

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
