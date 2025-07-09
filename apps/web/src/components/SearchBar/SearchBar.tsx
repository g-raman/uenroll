import React, { useCallback, useEffect, useState } from "react";
import TermSelector from "../TermSelector/TermSelector";
import toast from "react-hot-toast";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { AutoComplete } from "@repo/ui/components/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { Selected } from "@/types/Types";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";

export default function SearchBar() {
  const [selectedTerm] = useTermParam();
  const [data, setData] = useDataParam();

  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const { refetch } = useQuery(
    trpc.getCourse.queryOptions(
      { term: selectedTerm, courseCode: selectedValue },
      { enabled: false },
    ),
  );

  const { data: dataAllCourses } = useQuery(
    trpc.getAvailableCoursesByTerm.queryOptions(
      { term: selectedTerm },
      { staleTime: Infinity },
    ),
  );

  const autocompleteItems = dataAllCourses
    ? dataAllCourses.map((course, index) => {
        return {
          label: `${course.courseCode} ${course.courseTitle}`,
          value: course.courseCode,
          id: `${index}`,
        };
      })
    : [];

  const performSearch = useCallback(async () => {
    const { data: course, error, isSuccess } = await refetch();
    console.log(
      trpc.getCourse.queryOptions(
        { term: selectedTerm, courseCode: selectedValue },
        { enabled: false, staleTime: 100_000 },
      ).queryKey,
    );

    if (error) {
      toast.error(error.message);
    } else if (isSuccess) {
      if (!data) {
        const newSelected: Selected = {};
        newSelected[course.courseCode] = [];
        setData(newSelected);
      } else {
        const newSelected = { ...data };
        newSelected[course.courseCode] = [];
        setData(newSelected);
      }
    }
    setQuery("");
    setSelectedValue("");
  }, [refetch, data, selectedTerm, selectedValue, setData]);

  useEffect(() => {
    if (selectedValue === "") return;

    if (Object.keys(data ? data : {}).length >= MAX_RESULTS_ALLOWED) {
      setQuery("");
      setSelectedValue("");
      toast.error("Max search results reached.");
      return;
    }

    async function search() {
      await performSearch();
    }
    search();
  }, [performSearch, data, selectedValue]);

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
