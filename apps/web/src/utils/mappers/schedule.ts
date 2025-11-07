import { ScheduleItem, Selected } from "@/types/Types";

export const scheduleToSelected = (schedule: ScheduleItem[]) => {
  const selected: Selected = {};

  schedule.forEach(item => {
    const key = item.courseCode;

    if (!selected[key]) selected[key] = [item.subSection as string];
    else selected[key].push(item.subSection as string);
  });
  return selected;
};
