import React, { useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import toast from "react-hot-toast";
import {
  COURSE_GC_TIME,
  COURSE_STALE_TIME,
  MAX_RESULTS_ALLOWED,
} from "@/utils/constants";
import { AutoComplete } from "@repo/ui/components/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";

export default function SearchBar() {
  const [selectedTerm] = useTermParam();
  const [data, setData] = useDataParam();

  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const { data: dataAllCourses } = useQuery(
    trpc.getAvailableCoursesByTerm.queryOptions(
      { term: selectedTerm },
      { staleTime: Infinity },
    ),
  );
  const maxResultsReached =
    Object.keys(data ? data : {}).length > MAX_RESULTS_ALLOWED;

  const {
    data: courseData,
    error,
    isSuccess,
    isError,
  } = useQuery(
    trpc.getCourseByTermAndCourseCode.queryOptions(
      { term: selectedTerm, courseCode: selectedValue },
      {
        enabled: !!selectedValue && !maxResultsReached,
        staleTime: COURSE_STALE_TIME,
        gcTime: COURSE_GC_TIME,
      },
    ),
  );

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }

    if (isSuccess && courseData) {
      const newSelected = data ? { ...data } : {};
      newSelected[courseData.courseCode] = [];
      setData(newSelected);
    }

    if (isError || isSuccess) {
      setQuery("");
      setSelectedValue("");
    }
  }, [isError, error, isSuccess, courseData, data, setData]);

  const autocompleteItems = dataAllCourses
    ? dataAllCourses.map((course, index) => {
        return {
          label: `${course.courseCode} ${course.courseTitle}`,
          value: course.courseCode,
          id: `${index}`,
        };
      })
    : [];

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
          items={autocompleteItems}
        />
      </div>
    </div>
  );
}
