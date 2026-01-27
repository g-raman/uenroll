"use client";

import { Temporal } from "temporal-polyfill";
import { useState } from "react";
import { EventCalendar, CalendarEvent } from "@/components/EventCalendar";
import { TIMEZONE } from "@/utils/constants";

// Helper to create events for the current week
function createDemoEvents(): CalendarEvent[] {
  const today = Temporal.Now.zonedDateTimeISO(TIMEZONE).toPlainDate();
  // Get the start of the current week (Sunday)
  const dayOfWeek = today.dayOfWeek === 7 ? 0 : today.dayOfWeek;
  const weekStart = today.subtract({ days: dayOfWeek });

  const events: CalendarEvent[] = [
    // Monday events
    {
      id: "cs101-mon",
      title: "CS 101",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T09:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T10:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-red-400 bg-red-300",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      type: "LEC",
    },
    {
      id: "math201-mon",
      title: "MATH 201",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T11:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T12:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-sky-500 bg-sky-300",
      courseCode: "MATH 201",
      courseTitle: "Linear Algebra",
      instructor: "Dr. Johnson",
      type: "LEC",
    },
    {
      id: "phys150-mon",
      title: "PHYS 150",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T14:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 1 })}T15:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-lime-400 bg-lime-200",
      courseCode: "PHYS 150",
      courseTitle: "Mechanics",
      instructor: "Dr. Williams",
      type: "LEC",
    },

    // Tuesday events
    {
      id: "cs101-tut-tue",
      title: "CS 101",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T10:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T11:00[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-red-400 bg-red-300",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science",
      instructor: "TA: Alice",
      type: "TUT",
    },
    {
      id: "eng102-tue",
      title: "ENG 102",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T13:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T14:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-yellow-400 bg-yellow-200",
      courseCode: "ENG 102",
      courseTitle: "Technical Writing",
      instructor: "Prof. Brown",
      type: "LEC",
    },
    // Overlapping event on Tuesday
    {
      id: "club-meeting-tue",
      title: "CS Club",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T13:30[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 2 })}T14:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-purple-400 bg-purple-300",
      courseCode: "CLUB",
      courseTitle: "Computer Science Club Meeting",
      instructor: "Student Org",
      type: "MTG",
    },

    // Wednesday events
    {
      id: "cs101-wed",
      title: "CS 101",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T09:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T10:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-red-400 bg-red-300",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      type: "LEC",
    },
    {
      id: "math201-wed",
      title: "MATH 201",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T11:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T12:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-sky-500 bg-sky-300",
      courseCode: "MATH 201",
      courseTitle: "Linear Algebra",
      instructor: "Dr. Johnson",
      type: "LEC",
    },
    {
      id: "phys150-lab-wed",
      title: "PHYS 150",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T14:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 3 })}T17:00[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-lime-400 bg-lime-200",
      courseCode: "PHYS 150",
      courseTitle: "Mechanics Lab",
      instructor: "TA: Bob",
      type: "LAB",
    },

    // Thursday events
    {
      id: "math201-tut-thu",
      title: "MATH 201",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T09:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T10:00[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-sky-500 bg-sky-300",
      courseCode: "MATH 201",
      courseTitle: "Linear Algebra Tutorial",
      instructor: "TA: Carol",
      type: "TUT",
    },
    {
      id: "eng102-thu",
      title: "ENG 102",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T13:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T14:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-yellow-400 bg-yellow-200",
      courseCode: "ENG 102",
      courseTitle: "Technical Writing",
      instructor: "Prof. Brown",
      type: "LEC",
    },
    {
      id: "office-hours-thu",
      title: "Office Hours",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T15:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 4 })}T16:00[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-emerald-800 bg-emerald-400",
      courseCode: "CS 101",
      courseTitle: "Office Hours with Dr. Smith",
      instructor: "Dr. Smith",
      type: "OH",
    },

    // Friday events
    {
      id: "cs101-fri",
      title: "CS 101",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 5 })}T09:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 5 })}T10:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-red-400 bg-red-300",
      courseCode: "CS 101",
      courseTitle: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      type: "LEC",
    },
    {
      id: "phys150-fri",
      title: "PHYS 150",
      start: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 5 })}T14:00[${TIMEZONE}]`,
      ),
      end: Temporal.ZonedDateTime.from(
        `${weekStart.add({ days: 5 })}T15:30[${TIMEZONE}]`,
      ),
      backgroundColour: "text-black border-l-lime-400 bg-lime-200",
      courseCode: "PHYS 150",
      courseTitle: "Mechanics",
      instructor: "Dr. Williams",
      type: "LEC",
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
            dayStartHour: 8,
            dayEndHour: 18,
            hourHeight: 80,
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
