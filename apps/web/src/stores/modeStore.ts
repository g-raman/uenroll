import { create } from "zustand";

interface UserSettingsStore {
  isGenerationMode: boolean;
  hideWeekends: boolean;
  actions: UserSettingsActions;
}

interface UserSettingsActions {
  toggleMode: () => void;
  toggleHideWeekends: () => void;
}

const useUserSettingsStore = create<UserSettingsStore>(set => ({
  isGenerationMode: false,
  hideWeekends: false,
  actions: {
    toggleMode: () =>
      set(old => ({ ...old, isGenerationMode: !old.isGenerationMode })),
    toggleHideWeekends: () =>
      set(old => ({ ...old, hideWeekends: !old.hideWeekends })),
  },
}));

export const useMode = () =>
  useUserSettingsStore(state => state.isGenerationMode);

export const useHideWeekends = () =>
  useUserSettingsStore(state => state.hideWeekends);

export const useUserSettingsActions = () =>
  useUserSettingsStore(state => state.actions);
