import { Course, Selected, SelectedSession, Term } from "@/types/Types";
import { INITIAL_COLOURS } from "@/utils/constants";
import { createNewSelectedSessions, shuffleArray } from "@/utils/helpers";
import { create } from "zustand";

export interface InitializeDataPayload {
  courseSearchResults: Course[];
  selectedSessionsURL: Selected | null;
  selectedTerm: Term | null;
  availableTerms: Term[];
}

interface ScheduleActions {
  setInitialData: (initialData: InitializeDataPayload) => void;
}

interface ScheduleState {
  courseSearchResults: Course[];
  selectedSessionsURL: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  selectedTerm: Term | null;
  availableTerms: Term[];
  actions: ScheduleActions;
}

const useScheduleStore = create<ScheduleState>(set => ({
  courseSearchResults: [],
  selectedSessionsURL: null,
  selectedSessions: [],
  colours: shuffleArray(INITIAL_COLOURS),
  selectedTerm: null,
  availableTerms: [],
  actions: {
    setInitialData: initialData =>
      set(old => {
        const {
          selectedTerm,
          availableTerms,
          courseSearchResults,
          selectedSessionsURL,
        } = initialData;
        const colours = [...old.colours];
        courseSearchResults.forEach(course => (course.colour = colours.pop()));

        const selectedSessions = createNewSelectedSessions(
          courseSearchResults,
          selectedSessionsURL,
        );

        return {
          ...old,
          selectedTerm,
          availableTerms,
          courseSearchResults,
          selectedSessionsURL,
          selectedSessions,
          colours,
        };
      }),
  },
}));
