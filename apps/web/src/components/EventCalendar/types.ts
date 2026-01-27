import { Temporal } from "temporal-polyfill";

/**
 * Core calendar event type - matches the existing event structure used in the app
 */
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  /** Optional recurrence rule string (RRULE format) */
  rrule?: string;
  /** Background color classes for the event */
  backgroundColour?: string;
  /** Additional metadata that can be attached to events */
  [key: string]: unknown;
}

/**
 * Configuration options for the EventCalendar component
 */
export interface EventCalendarConfig {
  /** Timezone for displaying events (default: America/Toronto) */
  timezone?: string;
  /** Start hour of the day (0-23, default: 6) */
  dayStartHour?: number;
  /** End hour of the day (0-23, default: 23) */
  dayEndHour?: number;
  /** Height of each hour row in pixels (default: 60) */
  hourHeight?: number;
  /** Whether to show current time indicator (default: true) */
  showCurrentTime?: boolean;
  /** Custom date to display (default: today) */
  initialDate?: Temporal.PlainDate;
}

/**
 * Props for the main EventCalendar component
 */
export interface EventCalendarProps {
  /** Array of events to display */
  events: CalendarEvent[];
  /** Configuration options */
  config?: EventCalendarConfig;
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Custom render function for events */
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  /** Callback when the visible date range changes */
  onDateChange?: (date: Temporal.PlainDate) => void;
}

/**
 * Internal type for positioned events (with calculated layout)
 */
export interface PositionedEvent extends CalendarEvent {
  /** Top position as percentage */
  top: number;
  /** Height as percentage */
  height: number;
  /** Left position as percentage (for overlapping events) */
  left: number;
  /** Width as percentage (for overlapping events) */
  width: number;
  /** Column index for overlapping events */
  column: number;
  /** Total columns in this overlap group */
  totalColumns: number;
}

/**
 * Day column data for rendering
 */
export interface DayColumn {
  date: Temporal.PlainDate;
  dayOfWeek: string;
  dayNumber: number;
  isToday: boolean;
  events: PositionedEvent[];
}
