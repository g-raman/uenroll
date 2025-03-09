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
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  Reducer,
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

interface SearchResultsContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

interface TermsQueryState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: Term[] | undefined;
}

interface StateType {
  courses: Course[];
  selected: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  term: Term | null;
  availableTerms: Term[];
}
type ActionType =
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
    case "initialize_data": {
      const courses = action.payload.courses;
      const colours = [...state.colours];
      courses.forEach((course) => (course.colour = colours.pop()));

      const selectedSessions = createNewSelectedSessions(
        courses,
        action.payload.selected,
      );
      return {
        ...state,
        ...action.payload,
        colours,
        selectedSessions,
      };
    }

    case "change_term": {
      return {
        ...state,
        courses: [],
        selected: null,
        selectedSessions: [],
        term: action.payload,
      };
    }

    case "add_course": {
      const courseToAdd = action.payload;
      const isAlreadyAdded = state.courses.some(
        (addedCourse) => addedCourse.courseCode === courseToAdd.courseCode,
      );
      const [colour, ...restColours] = state.colours;

      return isAlreadyAdded
        ? state
        : {
            ...state,
            colours: restColours,
            courses: [{ ...courseToAdd, colour }, ...state.courses],
          };
    }

    case "remove_course": {
      const courseToRemove: Course = action.payload;
      const filteredCourses = state.courses.filter(
        (addedCourse) => addedCourse.courseCode !== courseToRemove.courseCode,
      );

      if (
        state.selected === null ||
        !state.selected[courseToRemove.courseCode]
      ) {
        return {
          ...state,
          courses: filteredCourses,
        };
      }
      const selected = { ...state.selected };
      delete selected[courseToRemove.courseCode];

      if (Object.keys(selected).length === 0)
        return {
          ...state,
          courses: filteredCourses,
          selected: null,
          selectedSessions: [],
        };

      const selectedSessions = createNewSelectedSessions(
        filteredCourses,
        selected,
      );

      return {
        ...state,
        courses: filteredCourses,
        selected,
        selectedSessions,
        colours: [...state.colours, courseToRemove.colour as string],
      };
    }

    case "reset_courses": {
      return {
        ...state,
        courses: [],
        selected: null,
        selectedSessions: [],
      };
    }

    case "add_selected": {
      const selectedToAdd: SelectedKey = action.payload;
      let selected: Selected | null = null;

      if (state.selected === null) {
        selected = {};
        selected[selectedToAdd.courseCode] = [selectedToAdd.subSection];
      } else if (!state.selected[selectedToAdd.courseCode]) {
        selected = { ...state.selected };
        selected[selectedToAdd.courseCode] = [selectedToAdd.subSection];
      } else if (
        state.selected[selectedToAdd.courseCode].some(
          (section) => section === selectedToAdd.subSection,
        )
      ) {
        selected = state.selected;
      } else {
        selected = { ...state.selected };
        selected[selectedToAdd.courseCode].push(selectedToAdd.subSection);
      }

      const selectedSessions = createNewSelectedSessions(
        state.courses,
        selected,
      );

      return {
        ...state,
        selected,
        selectedSessions,
      };
    }

    case "remove_selected": {
      const toRemove: SelectedKey = action.payload;

      if (state.selected === null) return state;

      if (!state.selected[toRemove.courseCode]) return state;

      const filteredSubsections = state.selected[toRemove.courseCode].filter(
        (subSection) => subSection !== toRemove.subSection,
      );

      const selected = { ...state.selected };
      if (filteredSubsections.length === 0)
        delete selected[toRemove.courseCode];

      if (Object.keys(selected).length === 0)
        return { ...state, selected: null, selectedSessions: [] };
      selected[toRemove.courseCode] = filteredSubsections;

      const selectedSessions = createNewSelectedSessions(
        state.courses,
        selected,
      );

      return {
        ...state,
        selected,
        selectedSessions,
      };
    }

    case "reset_selected": {
      return {
        ...state,
        selected: null,
        selectedSessions: [],
      };
    }
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
