import { ScheduleItem, Selected } from "@/types/Types";
import { create } from "zustand";

interface GeneratorState {
  excluded: Selected | null;
  schedules: ScheduleItem[][];
  selected: null | number;
  actions: GeneratorActions;
}

interface GeneratorActions {
  previousSchedule: () => void;
  nextSchedule: () => void;
  setSelectedSchedule: (selected: number | null) => void;
  setSchedules: (schedules: ScheduleItem[][]) => void;
  setExcluded: (excluded: Selected | null) => void;
  resetSchedules: () => void;
}

const useGeneratorStore = create<GeneratorState>(set => ({
  excluded: null,
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
    setExcluded: excluded => set(old => ({ ...old, excluded })),
    resetSchedules: () =>
      set(old => ({ ...old, selected: null, excluded: null, schedules: [] })),
  },
}));

export const useSchedules = () => useGeneratorStore(state => state.schedules);
export const useExcluded = () => useGeneratorStore(state => state.excluded);
export const useSelectedSchedule = () =>
  useGeneratorStore(state => state.selected);

export const useGeneratorActions = () =>
  useGeneratorStore(state => state.actions);
