import { Temporal } from "temporal-polyfill";
import { dayOfWeekToNumberMap, TIMEZONE } from "./constants";
import { Session } from "@repo/db/types";

export const getOffsettedStartDateTime = (
  date: string,
  time: string,
  dayOfWeek: string,
) => {
  const baseStartDate = getZonedDateTime(date, time);
  const target = dayOfWeekToNumberMap[dayOfWeek] as number;
  // Difference (could be negative if target < start day, so normalize with +7 % 7)
  const dayOffset = (target - baseStartDate.dayOfWeek + 7) % 7;

  return baseStartDate.add({ days: dayOffset });
};

export function isOverlappingTime(first: Session, second: Session) {
  const firstStart = getOffsettedStartDateTime(
    first.startDate,
    first.startTime,
    first.dayOfWeek,
  );

  const firstEnd = getOffsettedStartDateTime(
    first.startDate,
    first.endTime,
    first.dayOfWeek,
  );

  const secondStart = getOffsettedStartDateTime(
    second.startDate,
    second.startTime,
    second.dayOfWeek,
  );

  const secondEnd = getOffsettedStartDateTime(
    second.startDate,
    second.endTime,
    second.dayOfWeek,
  );

  // Standard overlap check
  return (
    Temporal.ZonedDateTime.compare(firstStart, secondEnd) < 0 &&
    Temporal.ZonedDateTime.compare(secondStart, firstEnd) < 0
  );
}

export const getPlainStringTime = (zonedDateTime: Temporal.ZonedDateTime) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: zonedDateTime.timeZoneId,
  }).format(new Date(zonedDateTime.epochMilliseconds));
};

export const getZonedDateTime = (date: string, time: string) => {
  return Temporal.ZonedDateTime.from(`${date}T${time}[${TIMEZONE}]`);
};
