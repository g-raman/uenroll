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

async function fetchCourses(courseCode: string, term: Term | null) {
  if (!term) {
    throw new Error("No Term Selected");
  }

  if (courseCode.length < 7) {
    throw new Error("Not a valid course code");
  }

  const containsNumber = (str: string): boolean => /\d/.test(str);
  const containsLetters = (str: string): boolean => /[a-zA-Z]/.test(str);

  if (!containsNumber(courseCode) || !containsLetters(courseCode)) {
    throw new Error("Not a valid course code");
  }

  const res = await fetch(`/api/v1/terms/${term.value}/courses/${courseCode}`);

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.data;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const { term } = useSearchResults();
  const { courses, selected, addCourse, resetCourses } = useSearchResults();
  const { data, error, isLoading, isSuccess, refetch } = useQuery<Course>({
    queryKey: ["courses", query, term],
    queryFn: () => fetchCourses(query, term),
    enabled: false,
    retry: false,
  });

  const {
    isLoading: isLoadingInitial,
    error: errorInitial,
    data: dataInitial,
  } = useQuery<Course[]>({
    queryKey: ["coursesInitial"],
    queryFn: async () => {
      const toFetch = selected.map((course) =>
        fetchCourses(course.courseCode, term),
      );
      const result = await Promise.all(toFetch);
      return result;
    },
  });

  useEffect(() => {
    if (!selected || !term || !dataInitial) {
      return;
    }

    dataInitial.forEach((course) => addCourse(course));
  }, [addCourse, dataInitial, selected, term]);

  React.useEffect(() => {
    if (isSuccess) {
      addCourse(data);
      setQuery("");
    } else if (error) {
      toast.error(error.message);
    }
  }, [addCourse, data, isSuccess, error]);

  const handleSearchClick = useCallback(() => {
    if (query.length === 0) return;
    refetch();
  }, [query, refetch]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  }

  return (
    <div className="sticky p-4 top-0 bg-white z-10 flex flex-col gap-2">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setQuery(event.target.value.toUpperCase())
          }
          className="border-slate-400 bg-slate-100 border text-xs w-full px-4 py-2 rounded-sm disabled:bg-slate-300 md:text-sm"
          type="text"
          placeholder="Course Code Eg. CSI 2101"
          disabled={isLoading}
        />

        <button
          onClick={resetCourses}
          className="w-min border-slate-400 border p-2 h-full rounded-sm text-black"
        >
          <FontAwesomeIcon className="h-4 aspect-square" icon={faTrash} />
        </button>

        <button
          onClick={handleSearchClick}
          className="w-min bg-red-700 p-2 h-full rounded-sm text-white disabled:bg-opacity-40"
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
