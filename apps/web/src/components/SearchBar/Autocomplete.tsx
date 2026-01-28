"use client";

import { trpc } from "@/app/_trpc/client";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { MAX_RESULTS_ALLOWED, GC_TIME, STALE_TIME } from "@/utils/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse, { type IFuseOptions } from "fuse.js";
import {
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { SearchIcon, LoaderCircleIcon } from "lucide-react";

interface CourseMatch {
  courseCode: string;
  courseTitle: string;
}

const MAX_VISIBLE_RESULTS = 7;

const FUSE_OPTIONS: IFuseOptions<CourseMatch> = {
  isCaseSensitive: false,
  keys: ["courseCode", "courseTitle"],
};

function stripSpacesFromCourseCode(input: string): string {
  if (/^[A-Za-z]{2,4}\s+\d/.test(input)) {
    return input.replace(/\s+/g, "");
  }
  return input;
}

export default function Autocomplete() {
  const [selectedTerm] = useTermParam();
  const [data, setData] = useDataParam();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const deferredQuery = useDeferredValue(
    stripSpacesFromCourseCode(query.trim()),
  );

  const { data: allCourses, isLoading } = useQuery(
    trpc.getAvailableCoursesByTerm.queryOptions(
      { term: selectedTerm },
      { staleTime: Infinity, enabled: !!selectedTerm },
    ),
  );

  const fuse = useMemo(() => {
    if (!allCourses) return null;

    const normalized = allCourses.map(c => ({
      courseCode: c.courseCode,
      courseTitle: c.courseTitle.replace(/\s*\(\+1 combined\)\s*/gi, "").trim(),
    }));

    return new Fuse(normalized, FUSE_OPTIONS);
  }, [allCourses]);

  const results = useMemo(() => {
    if (!fuse || !deferredQuery) return [];
    return fuse.search(deferredQuery, { limit: MAX_VISIBLE_RESULTS });
  }, [fuse, deferredQuery]);

  const selectedCodes = useMemo(() => new Set(Object.keys(data ?? {})), [data]);

  const isAtLimit = selectedCodes.size >= MAX_RESULTS_ALLOWED;

  const addCourse = useCallback(
    async (courseCode: string) => {
      if (selectedCodes.has(courseCode)) {
        toast.info(`${courseCode} is already selected`);
        return;
      }

      if (isAtLimit) {
        toast.error(`Maximum of ${MAX_RESULTS_ALLOWED} courses allowed`);
        return;
      }

      setIsAdding(true);
      try {
        await queryClient.fetchQuery(
          trpc.getCourseByTermAndCourseCode.queryOptions(
            { term: selectedTerm, courseCode },
            { staleTime: STALE_TIME, gcTime: GC_TIME },
          ),
        );

        const next = { ...(data ?? {}), [courseCode]: [] };
        setData(next);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add course",
        );
      } finally {
        setIsAdding(false);
        setQuery("");
        setOpen(false);
        setHighlightedIndex(0);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [selectedCodes, isAtLimit, queryClient, selectedTerm, data, setData],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(i => (i + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(i => (i - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[highlightedIndex]) {
            addCourse(results[highlightedIndex].item.courseCode);
          }
          break;
        case "Escape":
          setOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [results, highlightedIndex, addCourse],
  );

  if (isLoading) {
    return <Skeleton className="h-9 w-full rounded-md" />;
  }

  return (
    <Popover open={open && !!deferredQuery} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <InputGroup>
            <InputGroupAddon>
              {isAdding ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <SearchIcon className="size-4" />
              )}
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
                if (e.target.value.trim()) {
                  setOpen(true);
                }
              }}
              onFocus={() => {
                if (deferredQuery) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search for a course..."
              disabled={isAdding}
            />
          </InputGroup>
        }
      />

      <PopoverContent
        initialFocus={false}
        align="start"
        className="w-(--anchor-width) p-1"
      >
        {results.length === 0 && (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">
            No courses found
          </p>
        )}

        {results.length > 0 && (
          <ul role="listbox" className="flex flex-col gap-0.5">
            {results.map((result, index) => {
              const alreadySelected = selectedCodes.has(result.item.courseCode);
              return (
                <li
                  key={result.item.courseCode}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  aria-disabled={alreadySelected}
                  data-highlighted={index === highlightedIndex || undefined}
                  className="data-highlighted:bg-muted cursor-default rounded-sm px-3 py-1.5 text-sm select-none aria-disabled:opacity-50"
                  onPointerMove={() => setHighlightedIndex(index)}
                  onClick={() => {
                    if (!alreadySelected) {
                      addCourse(result.item.courseCode);
                    }
                  }}
                >
                  <span className="font-medium">{result.item.courseCode}</span>{" "}
                  <span className="text-muted-foreground">
                    {result.item.courseTitle}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
