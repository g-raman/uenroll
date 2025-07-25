import { shuffleArray } from "@/utils/arrays";
import { INITIAL_COLOURS } from "@/utils/constants";
import { create } from "zustand";

interface ColoursState {
  colours: string[];
  colourMap: Record<string, string>;
  actions: ColoursActions;
}

interface ColoursActions {
  getColour: (course: string) => string;
  addColour: (course: string, colour: string) => void;
  resetColours: () => void;
}

const useColoursStore = create<ColoursState>(set => ({
  colours: shuffleArray(INITIAL_COLOURS),
  colourMap: {},
  actions: {
    getColour: course => {
      let removedColour = "";
      set(old => {
        if (old.colourMap[course]) {
          removedColour = old.colourMap[course];
          return old;
        }

        const [removed, ...restColours] = old.colours;
        removedColour = removed || "";
        const newColourMap = { ...old.colourMap };
        newColourMap[course] = removedColour;

        return {
          ...old,
          colours: restColours,
          colourMap: newColourMap,
        };
      });
      return removedColour;
    },
    addColour: (course, colour) =>
      set(old => {
        const newColours = [...old.colours, colour];
        const newColourMap = { ...old.colourMap };
        delete newColourMap[course];

        return { ...old, colours: newColours, colourMap: newColourMap };
      }),
    resetColours: () =>
      set(() => ({ colours: shuffleArray(INITIAL_COLOURS), colourMap: {} })),
  },
}));

export const useColours = () => useColoursStore(state => state.colours);
export const useColoursActions = () => useColoursStore(state => state.actions);
