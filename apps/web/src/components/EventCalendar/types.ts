import { coursesToCalendarAppEvents } from "@/utils/mappers/calendar";
import { Temporal } from "temporal-polyfill";

export type CalendarEvent = ReturnType<typeof coursesToCalendarAppEvents>[0];

export interface EventCalendarConfig {
  termStart: Temporal.PlainDate;
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
  config: EventCalendarConfig;
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
