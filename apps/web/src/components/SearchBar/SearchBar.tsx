import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Course } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { fetchAllCourses, fetchCourse } from "@/utils/fetchData";
import { Button } from "@repo/ui/components/button";
import { AutoComplete } from "@repo/ui/components/autocomplete";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const { state, dispatch } = useSearchResults();
  const [selectedValue, setSelectedValue] = useState("");

  const { isLoading, refetch } = useQuery<Course>({
    queryKey: ["courses", selectedValue, state.term],
    queryFn: () => fetchCourse(selectedValue, state.term),
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
    } else if (error) {
      toast.error(error.message);
    }
  }, [dispatch, query.length, refetch, state.courses.length]);

  return (
    <div className="sticky top-0 z-10 mb-2 mt-4 flex flex-col gap-2 bg-white">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <AutoComplete
          searchValue={query}
          selectedValue={selectedValue}
          onSelectedValueChange={setSelectedValue}
          onSearchValueChange={setQuery}
          placeholder="Course Code or Course Name..."
          emptyMessage="No Courses Found..."
          items={
            dataAllCourses
              ? dataAllCourses.map((course, index) => {
                  return {
                    label: `${course.courseCode} ${course.courseTitle}`,
                    value: course.courseCode,
                    id: `${index}`,
                  };
                })
              : []
          }
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
    </div>
  );
}
