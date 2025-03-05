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
  const { courses, selected, addCourse, resetSelected } = useSearchResults();
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
    queryKey: ["coursesInitial", term, selected],
    queryFn: async () => {
      if (!term || !selected) {
        return [];
      }
      const toFetch = Object.keys(selected).map((courseCode) =>
        fetchCourses(courseCode, term),
      );
      try {
        const result = await Promise.all(toFetch);
        return result;
      } catch (error) {
        throw new Error(error as string);
      }
      return [];
    },
    retry: false,
  });

  useEffect(() => {
    if (errorInitial) resetSelected();

    if (!dataInitial) return;

    /*
     * Using a setTimeout here to avoid a race condition
     * when adding new courses.
     * The colour for each course is assigned in a useEffect on mount/unmount
     * and they all mutate the same variable.
     * Simple but hacky fix to just add a delay between each course.
     */
    const processCourses = async (courses: Course[]) => {
      for (const course of courses) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        addCourse(course);
      }
    };

    processCourses(dataInitial);
  }, [addCourse, resetSelected, dataInitial, errorInitial]);

  useEffect(() => {
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
    <div className="sticky mb-2 mt-4 top-0 bg-white z-10 flex flex-col gap-2">
      <TermSelector />
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setQuery(event.target.value.toUpperCase())
          }
          className="border-slate-400 bg-slate-100 border text-sm w-full px-4 py-2 rounded-sm disabled:bg-slate-300"
          type="text"
          placeholder="Course Code Eg. CSI 2101"
          disabled={isLoading || isLoadingInitial}
        />

        <button
          onClick={handleSearchClick}
          className="w-min h-full px-4 bg-[#8f001b] rounded-sm text-white disabled:bg-opacity-40"
          disabled={isLoading || isLoadingInitial}
        >
          {isLoading || isLoadingInitial ? (
            <FontAwesomeIcon className="size-4 animate-spin" icon={faSpinner} />
          ) : (
            <FontAwesomeIcon className="size-4" icon={faMagnifyingGlass} />
          )}
        </button>
      </div>
    </div>
  );
}
