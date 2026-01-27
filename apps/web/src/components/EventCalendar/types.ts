import { Temporal } from "temporal-polyfill";

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  rrule?: string;
  backgroundColour?: string;
  [key: string]: unknown;
}

export interface EventCalendarConfig {
  timezone?: string;
  dayStartHour?: number;
  dayEndHour?: number;
  hourHeight?: number;
  showCurrentTime?: boolean;
  initialDate?: Temporal.PlainDate;
  hideWeekends?: boolean;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  config?: EventCalendarConfig;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  onDateChange?: (date: Temporal.PlainDate) => void;
}

export interface PositionedEvent extends CalendarEvent {
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

export interface DayColumn {
  date: Temporal.PlainDate;
  dayOfWeek: string;
  dayNumber: number;
  isToday: boolean;
  events: PositionedEvent[];
}
