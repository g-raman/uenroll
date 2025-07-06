import React, { useCallback, useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { AutoComplete } from "@repo/ui/components/autocomplete";
import {
  useCourseSearchResults,
  useScheduleActions,
  useSelectedTerm,
} from "@/stores/scheduleStore";
import { Term } from "@repo/db/types";
import { trpc } from "@/app/_trpc/client";

export default function SearchBar() {
  const selectedTerm = useSelectedTerm() as Term;
  const courseSearchResults = useCourseSearchResults();
  const { addCourse } = useScheduleActions();

  const { refetch } = trpc.getCourse.useQuery(
    { term: selectedTerm?.value, courseCode: selectedValue },
    { enabled: false },
  );

  const { data: dataAllCourses } = trpc.getAvailableCoursesByTerm.useQuery(
    { term: selectedTerm?.value },
    { staleTime: Infinity },
  );

  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

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
