import { ScheduleItem } from "@/types/Types";
import { create } from "zustand";

interface GeneratorState {
  schedules: ScheduleItem[][];
  actions: GeneratorActions;
}

interface GeneratorActions {
  setSchedules: (schedules: ScheduleItem[][]) => void;
  resetSchedules: () => void;
}

const useGeneratorStore = create<GeneratorState>(set => ({
  schedules: [],
  actions: {
    setSchedules: (schedules: ScheduleItem[][]) =>
      set(old => ({ ...old, schedules })),
    resetSchedules: () => set(old => ({ ...old, schedules: [] })),
  },
}));

export const useSchedules = () => useGeneratorStore(state => state.schedules);
export const useGeneratorActions = () =>
  useGeneratorStore(state => state.actions);
