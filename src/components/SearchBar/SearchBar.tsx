import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Course, Term } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { fetchCourses } from "@/utils/fetchData";

export default function SearchBar() {
  const [query, setQuery] = useState("");
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  }

  return (
    <div className="sticky mb-2 mt-4 top-0 bg-white z-10 flex flex-col gap-2">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setQuery(event.target.value.toUpperCase())
          }
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
    </div>
  );
}
