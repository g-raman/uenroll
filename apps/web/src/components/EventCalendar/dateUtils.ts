import { Temporal } from "temporal-polyfill";
import { MONTH_NAMES_SHORT, MONTH_NAMES_FULL } from "./constants";

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  // Temporal uses ISO weekday: 1 = Monday, 7 = Sunday
  const dayOfWeek = date.dayOfWeek;
  return date.subtract({ days: dayOfWeek - 1 });
}

/**
 * Get an array of days starting from the week start
 * @param hideWeekends - If true, returns only Mon-Fri (5 days)
 */
export function getWeekDays(
  weekStart: Temporal.PlainDate,
  hideWeekends: boolean = false,
): Temporal.PlainDate[] {
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  if (hideWeekends) {
    // Filter out Saturday (6) and Sunday (7)
    return days.filter(d => d.dayOfWeek <= 5);
  }
  return days;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

/**
 * Get today's date in a specific timezone
 */
export function getToday(timezone: string): Temporal.PlainDate {
  return Temporal.Now.zonedDateTimeISO(timezone).toPlainDate();
}

/**
 * Format hour for display (e.g., "9 AM", "2 PM")
 */
export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Format time with minutes (e.g., "9:30 AM")
 */
export function formatTime(zonedDateTime: Temporal.ZonedDateTime): string {
  const hour = zonedDateTime.hour;
  const minute = zonedDateTime.minute;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Format a date for display (e.g., "January 2026")
 */
export function formatMonthYear(date: Temporal.PlainDate): string {
  return `${MONTH_NAMES_FULL[date.month - 1]} ${date.year}`;
}

/**
 * Format a date range for display (e.g., "Jan 20 - 26, 2026")
 */
export function formatWeekRange(weekStart: Temporal.PlainDate): string {
  const weekEnd = weekStart.add({ days: 6 });

  const startMonth = MONTH_NAMES_SHORT[weekStart.month - 1];
  const endMonth = MONTH_NAMES_SHORT[weekEnd.month - 1];

  if (weekStart.month === weekEnd.month) {
    return `${startMonth} ${weekStart.day} - ${weekEnd.day}, ${weekStart.year}`;
  }

  if (weekStart.year === weekEnd.year) {
    return `${startMonth} ${weekStart.day} - ${endMonth} ${weekEnd.day}, ${weekStart.year}`;
  }

  return `${startMonth} ${weekStart.day}, ${weekStart.year} - ${endMonth} ${weekEnd.day}, ${weekEnd.year}`;
}

/**
 * Generate hour labels for the time grid
 */
export function generateHourLabels(
  dayStartHour: number,
  dayEndHour: number,
): { hour: number; label: string }[] {
  const hours: { hour: number; label: string }[] = [];
  for (let hour = dayStartHour; hour <= dayEndHour; hour++) {
    hours.push({ hour, label: formatHour(hour) });
  }
  return hours;
}

/**
 * Get the current time position as a percentage within the day grid
 */
export function getCurrentTimePosition(
  timezone: string,
  dayStartHour: number,
  dayEndHour: number,
): number | null {
  const now = Temporal.Now.zonedDateTimeISO(timezone);
  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = dayStartHour * 60;
  const endMinutes = (dayEndHour + 1) * 60; // +1 because grid is inclusive

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return null;
  }

  return ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
}
