import {
  Component,
  Course,
  Selected,
  SelectedCourse,
  SelectedKey,
  SelectedSession,
  Session,
  Term,
} from "@/types/Types";
import { useQueryState } from "nuqs";
import React, {
  createContext,
  ReactNode,
  Reducer,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import LZString from "lz-string";
import { dayOfWeekToNumberMap, INITIAL_COLOURS } from "@/utils/constants";
import {
  createNewSelectedSessions,
  createSession,
  shuffleArray,
} from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses, fetchTerms } from "@/utils/fetchData";
import {
  handleAddCourse,
  handleAddSelected,
  handleChangeTerm,
  handleInitializeData,
  handleRemoveCourse,
  handleRemoveSelected,
  handleResetCourses,
  handleResetSelected,
} from "@/reducers/SearchResultsActions";

interface SearchResultsContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

export interface StateType {
  courses: Course[];
  selected: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  term: Term | null;
  availableTerms: Term[];
}

export type ActionType =
  | {
      type: "initialize_data";
      payload: {
        courses: Course[];
        selected: Selected | null;
        term: Term;
        availableTerms: Term[];
      };
    }
  | { type: "change_term"; payload: Term }
  | { type: "add_course"; payload: Course }
  | { type: "remove_course"; payload: Course }
  | { type: "reset_courses" }
  | { type: "add_selected"; payload: SelectedKey }
  | { type: "remove_selected"; payload: SelectedKey }
  | { type: "reset_selected" };

const shuffledColours = shuffleArray(INITIAL_COLOURS);
const initialState = {
  courses: [] as Course[],
  selected: null as Selected | null,
  selectedSessions: [] as SelectedSession[],
  colours: shuffledColours,
  term: null as Term | null,
  availableTerms: [],
};

const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case "initialize_data":
      return handleInitializeData(state, action);

    case "change_term":
      return handleChangeTerm(state, action);

    case "add_course":
      return handleAddCourse(state, action);

    case "remove_course":
      return handleRemoveCourse(state, action);

    case "reset_courses":
      return handleResetCourses(state);

    case "add_selected":
      return handleAddSelected(state, action);

    case "remove_selected":
      return handleRemoveSelected(state, action);

    case "reset_selected":
      return handleResetSelected(state);

    default:
      return state;
  }
};

const SearchResultsContext = createContext<
  SearchResultsContextType | undefined
>(undefined);

export const SearchResultsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer<Reducer<StateType, ActionType>>(
    reducer,
    initialState,
  );
  const [selected, setSelected] = useQueryState("data", {
    defaultValue: null,
    history: "replace",
    parse: (value) => JSON.parse(LZString.decompressFromBase64(value)),
    serialize: (value) => LZString.compressToBase64(JSON.stringify(value)),
  });
  const [term, setTerm] = useQueryState("term", {
    history: "replace",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const terms = await fetchTerms();
      const initialTerm = terms.find((termData) => termData.value === term);
      const selectedTerm = initialTerm ? initialTerm : terms[0];

      if (!selected) {
        dispatch({
          type: "initialize_data",
          payload: {
            courses: [],
            selected: null,
            term: selectedTerm,
            availableTerms: terms,
          },
        });
        return;
      }

      const toFetch = Object.keys(selected).map((courseCode) =>
        fetchCourses(courseCode, selectedTerm),
      );
      const results = await Promise.allSettled(toFetch);

      if (results.some((result) => result.status === "rejected")) return;

      const courses = results
        .filter((result) => result.status !== "rejected")
        .map((result) => result.value);

      dispatch({
        type: "initialize_data",
        payload: {
          courses,
          selected,
          term: selectedTerm,
          availableTerms: terms,
        },
      });
    };
    fetchInitialData();
  }, []);

  // Sync reducer state back to URL whenever data changes
  useEffect(() => {
    setSelected(state.selected);
  }, [state.selected, setSelected]);

  useEffect(() => {
    setTerm(state.term ? state.term.value : null);
  }, [state.term, setTerm]);

  return (
    <SearchResultsContext.Provider value={{ state, dispatch }}>
      {children}
    </SearchResultsContext.Provider>
  );
};

export const useSearchResults = (): SearchResultsContextType => {
  const context = useContext(SearchResultsContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
};
