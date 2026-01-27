"use client";

import { Temporal } from "temporal-polyfill";
import { useState } from "react";
import { EventCalendar, CalendarEvent } from "@/components/EventCalendar";
import { TIMEZONE } from "@/utils/constants";

// Helper to get the Monday of the current week
function getWeekStartMonday(timezone: string): Temporal.PlainDate {
  const today = Temporal.Now.zonedDateTimeISO(timezone).toPlainDate();
  // Temporal uses ISO weekday: 1 = Monday, 7 = Sunday
  const dayOfWeek = today.dayOfWeek;
  return today.subtract({ days: dayOfWeek - 1 });
}

// Helper to create demo events with recurring rules
function createDemoEvents(): CalendarEvent[] {
  // Get the Monday of the current week as term start
  const termStart = getWeekStartMonday(TIMEZONE);

  // Calculate end date (4 months from now)
  const termEnd = termStart.add({ months: 4 });
  const untilDate = `${termEnd.year}${String(termEnd.month).padStart(2, "0")}${String(termEnd.day).padStart(2, "0")}T235959Z`;

  const events: CalendarEvent[] = [
    // CS 101 - Monday, Wednesday, Friday at 9:00 AM
    {
      id: "cs101-lec",
      title: "CS 101",
      start: Temporal.ZonedDateTime.from(`${termStart}T09:00[${TIMEZONE}]`),
      end: Temporal.ZonedDateTime.from(`${termStart}T10:30[${TIMEZONE}]`),
      // Recurs every Monday, Wednesday, Friday
      rrule: `FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-red-400 bg-red-300",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      type: "LEC",
    },

    // MATH 201 - Monday, Wednesday at 11:00 AM
    {
      id: "math201-lec",
      title: "MATH 201",
      start: Temporal.ZonedDateTime.from(`${termStart}T11:00[${TIMEZONE}]`),
      end: Temporal.ZonedDateTime.from(`${termStart}T12:30[${TIMEZONE}]`),
      rrule: `FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-sky-500 bg-sky-300",
      courseCode: "MATH 201",
      courseTitle: "Linear Algebra",
      instructor: "Dr. Johnson",
      type: "LEC",
    },

    // PHYS 150 - Monday, Friday at 2:00 PM
    {
      id: "phys150-lec",
      title: "PHYS 150",
      start: Temporal.ZonedDateTime.from(`${termStart}T14:00[${TIMEZONE}]`),
      end: Temporal.ZonedDateTime.from(`${termStart}T15:30[${TIMEZONE}]`),
      rrule: `FREQ=WEEKLY;BYDAY=MO,FR;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-lime-400 bg-lime-200",
      courseCode: "PHYS 150",
      courseTitle: "Mechanics",
      instructor: "Dr. Williams",
      type: "LEC",
    },

    // CS 101 Tutorial - Tuesday at 10:00 AM
    {
      id: "cs101-tut",
      title: "CS 101 TUT",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T10:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T11:00[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=TU;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-red-400 bg-red-200",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science - Tutorial",
      instructor: "TA: Alice",
      type: "TUT",
    },

    // ENG 102 - Tuesday, Thursday at 1:00 PM
    {
      id: "eng102-lec",
      title: "ENG 102",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T13:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T14:30[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-yellow-400 bg-yellow-200",
      courseCode: "ENG 102",
      courseTitle: "Technical Writing",
      instructor: "Prof. Brown",
      type: "LEC",
    },

    // CS Club - Tuesday at 1:30 PM (overlaps with ENG 102)
    {
      id: "cs-club",
      title: "CS Club",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T13:30[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 1 })}T14:30[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=TU;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-purple-400 bg-purple-300",
      courseCode: "CLUB",
      courseTitle: "Computer Science Club Meeting",
      instructor: "Student Org",
      type: "MTG",
    },

    // PHYS 150 Lab - Wednesday at 2:00 PM (3 hours)
    {
      id: "phys150-lab",
      title: "PHYS 150 LAB",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 2 })}T14:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 2 })}T17:00[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=WE;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-lime-400 bg-lime-100",
      courseCode: "PHYS 150",
      courseTitle: "Mechanics Lab",
      instructor: "TA: Bob",
      type: "LAB",
    },

    // MATH 201 Tutorial - Thursday at 9:00 AM
    {
      id: "math201-tut",
      title: "MATH 201 TUT",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 3 })}T09:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 3 })}T10:00[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=TH;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-sky-500 bg-sky-200",
      courseCode: "MATH 201",
      courseTitle: "Linear Algebra Tutorial",
      instructor: "TA: Carol",
      type: "TUT",
    },

    // Office Hours - Thursday at 3:00 PM
    {
      id: "office-hours",
      title: "Office Hours",
      start: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 3 })}T15:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${termStart.add({ days: 3 })}T16:00[${TIMEZONE}]`,
      ),
      rrule: `FREQ=WEEKLY;BYDAY=TH;UNTIL=${untilDate}`,
      backgroundColour: "text-black border-l-emerald-800 bg-emerald-400",
      courseCode: "CS 101",
      courseTitle: "Office Hours with Dr. Smith",
      instructor: "Dr. Smith",
      type: "OH",
    },
  ];

  return events;
}

export default function CalendarDemoPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const demoEvents = createDemoEvents();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="flex h-dvh w-dvw flex-col bg-black p-4">
      {/* Page Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Calendar Demo</h1>
          <p className="text-sm text-gray-400">
            A custom week view calendar component with demo course data
          </p>
        </div>
        <a
          href="/"
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          Back to App
        </a>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 overflow-hidden rounded-lg">
        <EventCalendar
          events={demoEvents}
          config={{
            timezone: TIMEZONE,
            dayStartHour: 7,
            dayEndHour: 22,
            hourHeight: 48,
            showCurrentTime: true,
          }}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {String(selectedEvent.courseTitle ?? "")}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Type:
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${selectedEvent.backgroundColour}`}
                >
                  {String(selectedEvent.type ?? "Event")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Time:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedEvent.start.toLocaleString("en-US", {
                    weekday: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {selectedEvent.end.toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Instructor:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {String(selectedEvent.instructor ?? "TBA")}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={closeModal}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
