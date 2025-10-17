import React, { useEffect, useMemo, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import { toast } from "sonner";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { AutoComplete } from "@repo/ui/components/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { useCourseQuery } from "@/hooks/useCourseQuery";
import { DeleteSearchResultsButton } from "../Buttons/DeleteSearchResultsButton/DeleteSearchResultsButton";
import { ThemeSwitchingButton } from "../Buttons/ThemeSwitchingButton/ThemeSwitchingButton";

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
  const isUnderMaxResults =
    Object.keys(data ? data : {}).length < MAX_RESULTS_ALLOWED;

  const {
    data: courseData,
    error,
    isSuccess,
    isError,
  } = useCourseQuery(selectedValue, isUnderMaxResults);

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

  useEffect(() => {
    if (!isUnderMaxResults && !!selectedValue) {
      setQuery("");
      setSelectedValue("");
      toast.error("Max Search Results Reached");
    }
  }, [isUnderMaxResults, selectedValue]);

  const autocompleteItems = useMemo(
    () =>
      dataAllCourses
        ? dataAllCourses.map((course, index) => {
            return {
              label: `${course.courseCode} ${course.courseTitle}`,
              value: course.courseCode,
              id: `${index}`,
            };
          })
        : [],
    [dataAllCourses],
  );

  return (
    <div className="bg-background sticky top-0 z-10 flex flex-col gap-2 py-4">
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

      <div className="flex gap-2">
        <DeleteSearchResultsButton />
        <ThemeSwitchingButton />
      </div>
    </div>
  );
}
