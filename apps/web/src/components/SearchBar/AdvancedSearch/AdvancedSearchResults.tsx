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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="-mt-2 grid gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hasSubmitted
            ? isLoading
              ? t("advancedSearch.results.searching")
              : `${t("advancedSearch.results.count", { count: courses.length })}${courses.length >= RESULTS_LIMIT
                ? ` (${t("advancedSearch.results.limited", { limit: RESULTS_LIMIT })})`
                : ""
              }`
            : canSearch
              ? t("advancedSearch.results.pressSearch")
              : t("advancedSearch.results.setFilter")}
        </span>
        {isAtLimit && (
          <span className="font-medium text-destructive">
            {t("advancedSearch.results.maxCourses", { count: MAX_RESULTS_ALLOWED })}
          </span>
        )}
      </div>

      <div className="h-80 overflow-auto rounded-lg border border-input bg-muted/20">
        {/* Empty state — no filters submitted yet */}
        {!hasSubmitted && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-muted-foreground">
            <BookOpenIcon className="size-8 text-muted-foreground/50" />
            <p className="max-w-[18rem] text-center text-sm">
              {canSearch
                ? t("advancedSearch.results.ready")
                : t("advancedSearch.results.empty")}
            </p>
          </div>
        )}

        {/* Loading state */}
        {hasSubmitted && isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-muted-foreground">
            <LoaderCircleIcon className="size-6 animate-spin text-primary/60" />
            <p className="text-sm">{t("advancedSearch.results.finding")}</p>
          </div>
        )}

        {/* No results */}
        {hasSubmitted && !isLoading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-muted-foreground">
            <SearchIcon className="size-6 text-muted-foreground/50" />
            <p className="text-sm">{t("advancedSearch.results.noMatch")}</p>
          </div>
        )}

        {/* Results list */}
        {hasSubmitted && !isLoading && courses.length > 0 && (
          <div className="flex flex-col divide-y">
            {courses.map(course => {
              const alreadySelected = selectedCodes.has(course.courseCode);
              const isDisabled = alreadySelected || isAdding || isAtLimit;
              return (
                <div
                  key={course.courseCode}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {course.courseCode}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
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
                        {t("advancedSearch.results.added")}
                      </>
                    ) : (
                      <>
                        <PlusIcon className="mr-1 size-3" />
                        {t("advancedSearch.results.add")}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
