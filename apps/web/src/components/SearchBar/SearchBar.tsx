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
import { fetchAllCourses, fetchCourse } from "@/utils/fetchData";
import MiniSearch, { SearchResult } from "minisearch";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [autoCompleteResults, setAutoCompleteResults] = useState<
    SearchResult[]
  >([]);
  const [isAutoCompleteLoading, setIsAutoCompleteLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { state, dispatch } = useSearchResults();

  const { isLoading, refetch } = useQuery<Course>({
    queryKey: ["courses", query, state.term],
    queryFn: () => fetchCourse(query, state.term),
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
    queryKey: ["courses", state.term],
    queryFn: () => fetchAllCourses(state.term),
    staleTime: Infinity,
  });

  const search = useMemo(() => {
    const miniSearch = new MiniSearch<CourseAutocomplete>({
      fields: ["courseCode", "courseTitle"],
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
    if (!query || !search) {
      setAutoCompleteResults([]);
      return;
    }

    setIsAutoCompleteLoading(true);
    const timeoutId = setTimeout(() => {
      const results = search.search(query, {
        boost: { courseCode: 2 },
        fuzzy: 0.3,
        prefix: true,
      });
      const topResults = results ? results.slice(0, 5) : [];

      setAutoCompleteResults(topResults);
      setIsAutoCompleteLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search, dataAllCourses]);

  const handleSearchClick = useCallback(async () => {
    if (query.length === 0) return;

    if (state.courses.length >= MAX_RESULTS_ALLOWED) {
      toast.error("Max search results reached.");
      return;
    }

    const { data, error, isSuccess } = await refetch();
    if (isSuccess) {
      dispatch({ type: "add_course", payload: data });
      setQuery("");
      setIsFocused(false);
    } else if (error) {
      toast.error(error.message);
    }
  }, [dispatch, query.length, refetch, state.courses.length]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  /* Add small delay as clicking an autocomplete item
   * causes this to trigger to fast and completion to not work
   * */
  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleSelectAutoComplete = async (
    selectedCourse: CourseAutocomplete,
  ) => {
    handleBlur();
    setAutoCompleteResults([]);
    setQuery(selectedCourse.courseCode);
  };

  return (
    <div className="sticky top-0 z-10 mb-2 mt-4 flex flex-col gap-2 bg-white">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <Input
          value={query}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          type="text"
          placeholder="Course Code Eg. CSI 2101"
          disabled={isLoading}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <Button
          variant="default"
          size="icon"
          onClick={handleSearchClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <FontAwesomeIcon className="size-4 animate-spin" icon={faSpinner} />
          ) : (
            <FontAwesomeIcon className="size-4" icon={faMagnifyingGlass} />
          )}
        </Button>
      </div>

      {autoCompleteResults.length === 0 && isFocused ? (
        <div className="max-h-70 absolute top-24 z-10 w-full overflow-y-auto rounded-sm border border-gray-300 bg-white p-4 text-center text-sm text-gray-500 shadow-lg">
          {query.length === 0 ? (
            "Search for a course..."
          ) : isAutoCompleteLoading ? (
            <FontAwesomeIcon
              size="xl"
              className="animate-spin"
              icon={faSpinner}
            />
          ) : (
            "No Results Found..."
          )}
        </div>
      ) : (
        dataAllCourses &&
        isFocused && (
          <ul className="max-h-70 absolute top-24 z-20 w-full overflow-y-auto rounded-sm border border-gray-300 bg-white shadow-lg">
            {autoCompleteResults.map(result => (
              <li
                key={result.id}
                onPointerDown={() =>
                  handleSelectAutoComplete(
                    dataAllCourses[result.id] as CourseAutocomplete,
                  )
                }
                className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              >
                <div className="text-sm text-gray-800">
                  {dataAllCourses[result.id]?.courseCode}:&nbsp;
                  {dataAllCourses[result.id]?.courseTitle.replaceAll(
                    /\(\+\d+ combined\)/g,
                    "",
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
