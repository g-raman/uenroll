import { useQueryState } from "nuqs";
import React, {
  createContext,
  ReactNode,
  Reducer,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import LZString from "lz-string";
import { INITIAL_COLOURS } from "@/utils/constants";
import { shuffleArray } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses, fetchTerms } from "@/utils/fetchData";
import { ActionType, StateType } from "@/reducers/types";
import { searchResultsRedcuer } from "@/reducers/searchResultsReducer";

interface SearchResultsContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

const shuffledColours = shuffleArray(INITIAL_COLOURS);

const initialState: StateType = {
  courses: [],
  selected: null,
  selectedSessions: [],
  colours: shuffledColours,
  term: null,
  availableTerms: [],
};

const SearchResultsContext = createContext<
  SearchResultsContextType | undefined
>(undefined);

export const SearchResultsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer<Reducer<StateType, ActionType>>(
    searchResultsRedcuer,
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

      if (!initialTerm || !selected) {
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
