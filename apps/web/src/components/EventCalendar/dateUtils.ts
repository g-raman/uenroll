import { Temporal } from "temporal-polyfill";
import { MONTH_NAMES_SHORT, MONTH_NAMES_FULL } from "./constants";

export function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  // Temporal uses ISO weekday: 1 = Monday, 7 = Sunday
  const dayOfWeek = date.dayOfWeek;
  return date.subtract({ days: dayOfWeek - 1 });
}

export function isSameDay(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean {
  return Temporal.PlainDate.compare(a, b) === 0;
}

export function getToday(timezone: string): Temporal.PlainDate {
  return Temporal.Now.zonedDateTimeISO(timezone).toPlainDate();
}

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function formatTime(zonedDateTime: Temporal.ZonedDateTime): string {
  const hour = zonedDateTime.hour;
  const minute = zonedDateTime.minute;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export function formatMonthYear(date: Temporal.PlainDate): string {
  return `${MONTH_NAMES_FULL[date.month - 1]} ${date.year}`;
}

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
