import { create } from "zustand";

interface ModeState {
  isGenerationMode: boolean;
  actions: ModeActions;
}

interface ModeActions {
  toggleMode: () => void;
}

const useModeStore = create<ModeState>(set => ({
  isGenerationMode: false,
  actions: {
    toggleMode: () =>
      set(old => ({ ...old, isGenerationMode: !old.isGenerationMode })),
  },
}));

export const useMode = () => useModeStore(state => state.isGenerationMode);
export const useModeActions = () => useModeStore(state => state.actions);
