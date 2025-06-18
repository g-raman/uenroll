import { dayOfWeekToNumberMap } from "./constants";

export interface TimeSlot {
  startDate: string;
  startTime: string;
  dayOfWeek: string;
  endDate: string;
  endTime: string;
}

export function getActualDateFromWeekdayOffset(
  date: string,
  time: string,
  dayOfWeek: string,
) {
  const baseDate = dayjs(`${date} ${time} GMT`);
  const dayOffset =
    (dayOfWeekToNumberMap[dayOfWeek] as number) - baseDate.day();
  const actualDate = baseDate.add(
    dayOffset < 0 ? 7 + dayOffset : dayOffset,
    "days",
  );
  return actualDate;
}

export function isOverlappingTime(first: TimeSlot, second: TimeSlot) {
  const firstDateStartTime = getActualDateFromWeekdayOffset(
    first.startDate,
    first.startTime,
    first.dayOfWeek,
  );

  const firstDateEndTime = getActualDateFromWeekdayOffset(
    first.startDate,
    first.endTime,
    first.dayOfWeek,
  );

  const secondDateStartTime = getActualDateFromWeekdayOffset(
    second.startDate,
    second.startTime,
    second.dayOfWeek,
  );

  const secondDateEndTime = getActualDateFromWeekdayOffset(
    second.startDate,
    second.endTime,
    second.dayOfWeek,
  );

  const range1overlaps =
    firstDateStartTime.isSame(secondDateEndTime) ||
    firstDateStartTime.isBefore(secondDateEndTime);
  const range2overlaps =
    firstDateEndTime.isSame(secondDateStartTime) ||
    firstDateEndTime.isAfter(secondDateStartTime);

  return range1overlaps && range2overlaps;
}
