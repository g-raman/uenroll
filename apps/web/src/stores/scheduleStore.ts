import { Course, Selected, SelectedSession, Term } from "@/types/Types";
import { INITIAL_COLOURS } from "@/utils/constants";
import { shuffleArray } from "@/utils/helpers";
import { create } from "zustand";

interface ScheduleState {
  courseSearchResults: Course[];
  selectedSessionsURL: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  selectedTerm: Term | null;
  availableTerms: Term[];
}

const useScheduleStore = create<ScheduleState>(set => ({
  courseSearchResults: [],
  selectedSessionsURL: null,
  selectedSessions: [],
  colours: shuffleArray(INITIAL_COLOURS),
  selectedTerm: null,
  availableTerms: [],
}));
