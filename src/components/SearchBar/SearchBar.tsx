import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Course, CourseAutocomplete } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TermSelector from "../TermSelector/TermSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { fetchAllCourses, fetchCourses } from "@/utils/fetchData";
import MiniSearch, { SearchResult } from "minisearch";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [autoComplete, setAutoComplete] = useState<SearchResult[]>([]);
  const [isAutoCompleteLoading, setIsAutoCompleteLoading] = useState(false);
  const { state, dispatch } = useSearchResults();

  const { data, error, isLoading, isSuccess, refetch } = useQuery<Course>({
    queryKey: ["courses", query, state.term],
    queryFn: () => fetchCourses(query, state.term),
    enabled: false,
    retry: false,
    gcTime: 0,
    networkMode: "online",
  });
  /*
   * TODO: Fix caching
   * If caching is enabled. A course is automatically added
   * to results list without the user hitting enter or the
   * search button.
   *
   * It bypasses the check for whether you're allowed to add
   * another result
   */

  const { data: dataAllCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchAllCourses,
    staleTime: Infinity,
  });

  const search = useMemo(() => {
    const miniSearch = new MiniSearch<CourseAutocomplete>({
      fields: ["course_code", "course_title"],
    });

    if (!dataAllCourses) return miniSearch;

    const parsedCourses = dataAllCourses.map((course, i: number) => {
      return {
        ...course,
        id: i,
      };
    });

    miniSearch.addAll(parsedCourses);
    return miniSearch;
  }, [dataAllCourses]);

  useEffect(() => {
    if (isSuccess) {
      dispatch({ type: "add_course", payload: data });
      setQuery("");
    } else if (error) toast.error(error.message);
  }, [data, isSuccess, error, dispatch]);

  const handleSearchClick = useCallback(() => {
    if (query.length === 0) return;

    if (state.courses.length >= MAX_RESULTS_ALLOWED) {
      toast.error("Max search results reached.");
      return;
    }

    refetch();
  }, [query.length, refetch, state.courses.length]);

  useEffect(() => {
    if (!query || !search) {
      setAutoComplete([]);
      return;
    }

    setIsAutoCompleteLoading(true);
    const timeoutId = setTimeout(() => {
      const results = search.search(query, {
        boost: { course_code: 2 },
        fuzzy: 0.2,
        prefix: true,
      });
      const topResults = results ? results.slice(0, 5) : [];

      setAutoComplete(topResults);
      setIsAutoCompleteLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search, dataAllCourses]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  }

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value.toUpperCase());
  }, []);

  const handleSelect = (selectedCourse: CourseAutocomplete) => {
    setQuery(selectedCourse.course_code);
    setAutoComplete([]);
  };

  return (
    <div className="sticky mb-2 mt-4 top-0 bg-white z-10 flex flex-col gap-2">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          className="border-slate-400 bg-slate-100 border text-sm w-full px-4 py-2 rounded-xs disabled:bg-slate-300"
          type="text"
          placeholder="Course Code Eg. CSI 2101"
          disabled={isLoading}
        />

        <button
          onClick={handleSearchClick}
          className="cursor-pointer w-min h-full px-4 bg-[#8f001b] rounded-xs text-white disabled:bg-[#8f001b]-40"
          disabled={isLoading}
        >
          {isLoading ? (
            <FontAwesomeIcon className="size-4 animate-spin" icon={faSpinner} />
          ) : (
            <FontAwesomeIcon className="size-4" icon={faMagnifyingGlass} />
          )}
        </button>
      </div>

      {autoComplete.length > 0 && !isAutoCompleteLoading && dataAllCourses ? (
        <ul className="absolute top-24 w-full bg-white border border-gray-300 rounded-sm max-h-70 overflow-y-auto shadow-lg z-10">
          {autoComplete.map((result) => (
            <li
              key={result.id}
              onClick={() => handleSelect(dataAllCourses[result.id])}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              <div className="text-sm font-medium text-gray-800">
                {dataAllCourses[result.id].course_code}:&nbsp;
                {dataAllCourses[result.id].course_title.replaceAll(
                  "(+1 combined)",
                  "",
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">
          <FontAwesomeIcon
            size="xl"
            className="animate-spin"
            icon={faSpinner}
          />
        </div>
      )}
    </div>
  );
}
