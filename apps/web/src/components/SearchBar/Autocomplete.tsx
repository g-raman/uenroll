import { trpc } from "@/app/_trpc/client";
import { useCourseQuery } from "@/hooks/useCourseQuery";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Remove spaces only when searching by course code
// ADM 1100 -> becomes ADM1100
// Introduction to Business -> remains untouched
const normalizeCourseCode = (str: string) => {
  const pattern = /^([A-Za-z]{3})\s+(\d.*)$/;
  if (pattern.test(str)) {
    return str.replace(/\s+/g, "");
  }
  return str;
};

export default function Autocomplete() {
  const [selectedTerm] = useTermParam();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [data, setData] = useDataParam();

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

  useEffect(() => {
    const cleanQuery = query.replaceAll(" ", "").trim();
    const handler = setTimeout(() => setDebouncedQuery(cleanQuery), 200);
    return () => clearTimeout(handler);
  }, [query]);

  const fuse = useMemo(() => {
    const toParse = dataAllCourses ?? [];
    const parsed = toParse.map(course => ({
      courseCode: course.courseCode,
      courseTitle: course.courseTitle.replaceAll(/\s+/g, ""),
      displayCourseTitle: course.courseTitle
        .replace(/\s*\(\+1 combined\)\s*/gi, "")
        .trim(),
    }));

    return new Fuse(parsed, {
      isCaseSensitive: false,
      keys: ["courseCode", "courseTitle"],
    });
  }, [dataAllCourses]);

  const results = useMemo(
    () => fuse.search(debouncedQuery),
    [fuse, debouncedQuery],
  );

  const items = useMemo(
    () =>
      results.slice(0, 7).map(result => (
        <CommandItem
          onSelect={() => setSelectedValue(result.item.courseCode)}
          key={`autocomplete-${result.item.courseCode}-${result.item.courseTitle}`}
        >
          {`${result.item.courseCode} ${result.item.displayCourseTitle}`}
        </CommandItem>
      )),
    [results],
  );
  if (!dataAllCourses) return <Skeleton className="h-8" />;

  return (
    <Popover>
      <Command>
        <PopoverTrigger asChild>
          <CommandInput
            value={query}
            onValueChange={newString =>
              setQuery(normalizeCourseCode(newString))
            }
            placeholder="Type a course code or course name"
          />
        </PopoverTrigger>

        <PopoverContent
          onOpenAutoFocus={e => e.preventDefault()}
          className="p-1"
        >
          <CommandList>
            <CommandEmpty className="px-2 py-4 text-xs">
              {debouncedQuery.length > 0 &&
                results.length === 0 &&
                "No results found"}

              {debouncedQuery.length === 0 &&
                results.length === 0 &&
                "Type in a course code or course name"}
            </CommandEmpty>

            {results.length > 0 && (
              <CommandGroup heading="Results">{items}</CommandGroup>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
