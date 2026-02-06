import { MAX_RESULTS_ALLOWED } from "@/utils/constants";
import { Button } from "@repo/ui/components/button";
import {
  CheckIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  BookOpenIcon,
} from "lucide-react";
import { RESULTS_LIMIT } from "./advanced-search-constants";

type AdvancedSearchResultsProps = {
  hasSubmitted: boolean;
  isLoading: boolean;
  canSearch: boolean;
  courses: { courseCode: string; courseTitle: string }[];
  selectedCodes: Set<string>;
  isAdding: boolean;
  isAtLimit: boolean;
  onAddCourse: (courseCode: string) => void;
};

export function AdvancedSearchResults({
  hasSubmitted,
  isLoading,
  canSearch,
  courses,
  selectedCodes,
  isAdding,
  isAtLimit,
  onAddCourse,
}: AdvancedSearchResultsProps) {
  return (
    <div className="-mt-2 grid gap-2">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          {hasSubmitted
            ? isLoading
              ? "Searching..."
              : `${courses.length} result${courses.length === 1 ? "" : "s"}${courses.length >= RESULTS_LIMIT ? ` (limited to ${RESULTS_LIMIT})` : ""}`
            : canSearch
              ? "Press Search to see results."
              : "Set at least one filter to search."}
        </span>
        {isAtLimit && (
          <span className="text-destructive font-medium">
            Max {MAX_RESULTS_ALLOWED} courses
          </span>
        )}
      </div>

      <div className="border-input bg-muted/20 max-h-72 overflow-auto rounded-lg border">
        {/* Empty state — no filters submitted yet */}
        {!hasSubmitted && (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10">
            <BookOpenIcon className="text-muted-foreground/50 size-8" />
            <p className="max-w-[18rem] text-center text-sm">
              {canSearch
                ? "Ready to search. Press the Search button or hit Enter."
                : "Enter a subject code, select a year, or choose a language to get started."}
            </p>
          </div>
        )}

        {/* Loading state */}
        {hasSubmitted && isLoading && (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10">
            <LoaderCircleIcon className="text-primary/60 size-6 animate-spin" />
            <p className="text-sm">Finding courses...</p>
          </div>
        )}

        {/* No results */}
        {hasSubmitted && !isLoading && courses.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10">
            <SearchIcon className="text-muted-foreground/50 size-6" />
            <p className="text-sm">No courses match those filters.</p>
          </div>
        )}

        {/* Results list */}
        {hasSubmitted && !isLoading && courses.length > 0 && (
          <ul className="flex flex-col divide-y">
            {courses.map(course => {
              const alreadySelected = selectedCodes.has(course.courseCode);
              const isDisabled = alreadySelected || isAdding || isAtLimit;
              return (
                <li
                  key={course.courseCode}
                  className="hover:bg-muted/40 flex items-center justify-between gap-3 px-4 py-2.5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {course.courseCode}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {course.courseTitle}
                    </p>
                  </div>
                  <Button
                    variant={alreadySelected ? "ghost" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => onAddCourse(course.courseCode)}
                    className="shrink-0"
                  >
                    {alreadySelected ? (
                      <>
                        <CheckIcon
                          strokeWidth={3}
                          className="mr-1 size-4 text-emerald-500"
                        />
                        Added
                      </>
                    ) : (
                      <>
                        <PlusIcon className="mr-1 size-3" />
                        Add
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
