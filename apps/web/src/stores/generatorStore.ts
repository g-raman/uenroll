import { ScheduleItem } from "@/types/Types";
import { create } from "zustand";

interface GeneratorState {
  schedules: ScheduleItem[][];
  selected: null | number;
  actions: GeneratorActions;
}

interface GeneratorActions {
  previousSchedule: () => void;
  nextSchedule: () => void;
  setSelectedSchedule: (selected: number | null) => void;
  setSchedules: (schedules: ScheduleItem[][]) => void;
  resetSchedules: () => void;
}

const useGeneratorStore = create<GeneratorState>(set => ({
  schedules: [],
  selected: null,
  actions: {
    previousSchedule: () =>
      set(old => ({
        ...old,
        selected:
          old.selected !== null
            ? (((old.selected - 1) % old.schedules.length) +
                old.schedules.length) %
              old.schedules.length
            : null,
      })),
    nextSchedule: () =>
      set(old => ({
        ...old,
        selected:
          old.selected !== null
            ? (old.selected + 1) % old.schedules.length
            : null,
      })),
    setSelectedSchedule: selected => set(old => ({ ...old, selected })),
    setSchedules: (schedules: ScheduleItem[][]) =>
      set(old => ({
        ...old,
        schedules,
        selected: schedules.length > 0 ? 0 : null,
      })),
    resetSchedules: () =>
      set(old => ({ ...old, selected: null, schedules: [] })),
  },
}));

export const useSchedules = () => useGeneratorStore(state => state.schedules);
export const useSelectedSchedule = () =>
  useGeneratorStore(state => state.selected);
export const useGeneratorActions = () =>
  useGeneratorStore(state => state.actions);
