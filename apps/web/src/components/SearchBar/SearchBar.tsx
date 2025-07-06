import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { fetchAllCourses, fetchCourse } from "@/utils/fetchData";
import { AutoComplete } from "@repo/ui/components/autocomplete";
import {
  useCourseSearchResults,
  useScheduleActions,
  useSelectedTerm,
} from "@/stores/scheduleStore";
import { CourseSearchResult } from "@repo/db/types";

export default function SearchBar() {
  const selectedTerm = useSelectedTerm();
  const courseSearchResults = useCourseSearchResults();
  const { addCourse } = useScheduleActions();

  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const { refetch } = useQuery<CourseSearchResult>({
    queryKey: ["courses", selectedValue, selectedTerm],
    queryFn: () => fetchCourse(selectedValue, selectedTerm),
    enabled: false,
    retry: false,
    networkMode: "online",
    gcTime: 1_800_000, // 30 minutes
  });

  const { data: dataAllCourses } = useQuery({
    queryKey: ["courses", selectedTerm],
    queryFn: () => fetchAllCourses(selectedTerm),
    staleTime: Infinity,
  });

  const performSearch = useCallback(async () => {
    const { data, error, isSuccess } = await refetch();
    if (isSuccess) {
      addCourse(data);
    } else if (error) {
      toast.error(error.message);
    }
    setQuery("");
    setSelectedValue("");
  }, [addCourse, refetch]);

  useEffect(() => {
    if (selectedValue === "") return;

    if (courseSearchResults.length >= MAX_RESULTS_ALLOWED) {
      setQuery("");
      setSelectedValue("");
      toast.error("Max search results reached.");
      return;
    }

    async function search() {
      await performSearch();
    }
    search();
  }, [performSearch, selectedValue, courseSearchResults.length]);

  return (
    <div className="sticky top-0 z-10 mb-2 flex flex-col gap-2">
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
