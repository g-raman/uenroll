import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Course } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { fetchAllCourses, fetchCourse } from "@/utils/fetchData";
import { AutoComplete } from "@repo/ui/components/autocomplete";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const { state, dispatch } = useSearchResults();
  const [selectedValue, setSelectedValue] = useState("");

  const { refetch } = useQuery<Course>({
    queryKey: ["courses", selectedValue, state.term],
    queryFn: () => fetchCourse(selectedValue, state.term),
    enabled: false,
    retry: false,
    networkMode: "online",
  });

  const { data: dataAllCourses } = useQuery({
    queryKey: ["courses", state.term],
    queryFn: () => fetchAllCourses(state.term),
    staleTime: Infinity,
  });

  const performSearch = useCallback(async () => {
    const { data, error, isSuccess } = await refetch();
    if (isSuccess) {
      dispatch({ type: "add_course", payload: data });
    } else if (error) {
      toast.error(error.message);
    }
    setQuery("");
    setSelectedValue("");
  }, [dispatch, refetch]);

  useEffect(() => {
    if (selectedValue === "") return;

    if (state.courses.length >= MAX_RESULTS_ALLOWED) {
      setQuery("");
      setSelectedValue("");
      toast.error("Max search results reached.");
      return;
    }

    async function search() {
      await performSearch();
    }
    search();
  }, [performSearch, selectedValue]);

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
      </div>
    </div>
  );
}
