import { INITIAL_COLOURS } from "@/utils/constants";
import { shuffleArray } from "@/utils/helpers";
import { create } from "zustand";

interface ColoursState {
  colours: string[];
  actions: ColoursActions;
}

interface ColoursActions {
  removeColour: () => string;
  addColour: (colour: string) => void;
}

const useColoursStore = create<ColoursState>(set => ({
  colours: shuffleArray(INITIAL_COLOURS),
  actions: {
    removeColour: () => {
      let removedColour = "";
      set(old => {
        const [removed, ...restColours] = old.colours;
        removedColour = removed || "";
        return { ...old, restColours };
      });
      return removedColour;
    },
    addColour: colour =>
      set(old => ({ ...old, colours: [...old.colours, colour] })),
  },
}));

export const useColours = () => useColoursStore(state => state.colours);
export const useColoursActions = () => useColoursStore(state => state.actions);
