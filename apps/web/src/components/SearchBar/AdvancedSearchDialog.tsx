"use client";

import { trpc } from "@/app/_trpc/client";
import { MAX_RESULTS_ALLOWED, STALE_TIME } from "@/utils/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  BookOpenIcon,
  FilterXIcon,
} from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

const YEAR_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "1st", value: "1" },
  { label: "2nd", value: "2" },
  { label: "3rd", value: "3" },
  { label: "4th", value: "4" },
  { label: "Grad (5+)", value: "5" },
] as const;

const LANGUAGE_OPTIONS = [
  { label: "Any", value: "any", description: undefined },
  { label: "English", value: "english", description: undefined },
  { label: "French", value: "french", description: undefined },
  {
    label: "Other",
    value: "other",
    description: "Bilingual or other languages (e.g. Spanish)",
  },
] as const;

const RESULTS_LIMIT = 200;

type YearValue = (typeof YEAR_OPTIONS)[number]["value"];
type LanguageValue = (typeof LANGUAGE_OPTIONS)[number]["value"];

type AdvancedSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term: string;
  selectedCodes: Set<string>;
  isAdding: boolean;
  isAtLimit: boolean;
  onAddCourse: (courseCode: string) => void;
};

export function AdvancedSearchDialog({
  open,
  onOpenChange,
  term,
  selectedCodes,
  isAdding,
  isAtLimit,
  onAddCourse,
}: AdvancedSearchDialogProps) {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState<YearValue>("any");
  const [language, setLanguage] = useState<LanguageValue>("any");
  const [submittedFilters, setSubmittedFilters] = useState<{
    subject?: string;
    year?: number;
    language?: "english" | "french" | "other";
  } | null>(null);

  const normalizedSubject = useMemo(
    () =>
      subject
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, ""),
    [subject],
  );
  const yearFilter = year === "any" ? undefined : Number(year);
  const languageFilter = language === "any" ? undefined : language;
  const canSearch =
    Boolean(term) &&
    (normalizedSubject.length > 0 || yearFilter || languageFilter);
  const hasSubmitted = submittedFilters !== null;
  const hasActiveFilters =
    normalizedSubject.length > 0 || year !== "any" || language !== "any";
  const queryInput = submittedFilters
    ? {
        term,
        subject: submittedFilters.subject,
        year: submittedFilters.year,
        language: submittedFilters.language,
        limit: RESULTS_LIMIT,
      }
    : {
        term,
        subject: undefined,
        year: undefined,
        language: undefined,
        limit: RESULTS_LIMIT,
      };

  const { data: results, isLoading } = useQuery(
    trpc.getCoursesByFilter.queryOptions(queryInput, {
      enabled: Boolean(term) && hasSubmitted,
      staleTime: STALE_TIME,
    }),
  );

  const courses = results ?? [];

  const handleSearch = () => {
    if (!canSearch) return;
    setSubmittedFilters({
      subject: normalizedSubject || undefined,
      year: yearFilter,
      language: languageFilter,
    });
  };

  const handleClearFilters = () => {
    setSubject("");
    setYear("any");
    setLanguage("any");
    setSubmittedFilters(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Advanced search</DialogTitle>
          <DialogDescription>
            Filter by subject, year, or language, then add courses to your
            playground.
          </DialogDescription>
        </DialogHeader>

        {/* Filters section */}
        <div className="grid gap-4">
          {/* Subject input with integrated search */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="subject-filter">
                Subject code
              </label>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                >
                  <FilterXIcon className="size-3" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="subject-filter"
                placeholder="e.g. ADM, CSI, ITI..."
                value={subject}
                onChange={event => {
                  setSubject(
                    event.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
                  );
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="min-w-0 flex-1"
              />
              <Button
                size="default"
                disabled={!canSearch}
                onClick={handleSearch}
              >
                <SearchIcon className="mr-1.5 size-3.5" />
                Search
              </Button>
            </div>
          </div>

          {/* Filter toggles */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <fieldset className="grid gap-1.5">
              <legend className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Year
              </legend>
              <div className="flex gap-1.5">
                {YEAR_OPTIONS.map(option => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="course-year"
                      value={option.value}
                      checked={year === option.value}
                      onChange={() => setYear(option.value)}
                      className="peer sr-only"
                    />
                    <span className="border-input bg-background text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap transition-all peer-checked:shadow-xs">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-1.5">
              <legend className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Language
              </legend>
              <div className="flex gap-1.5">
                {LANGUAGE_OPTIONS.map(option => {
                  const radio = (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="course-language"
                        value={option.value}
                        checked={language === option.value}
                        onChange={() => setLanguage(option.value)}
                        className="peer sr-only"
                      />
                      <span className="border-input bg-background text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all peer-checked:shadow-xs">
                        {option.label}
                      </span>
                    </label>
                  );

                  if (option.description) {
                    return (
                      <Tooltip key={option.value}>
                        <TooltipTrigger render={radio} />
                        <TooltipContent>{option.description}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return radio;
                })}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Divider */}
        <div className="bg-border -mx-6 h-px" />

        {/* Results section */}
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
                            <CheckIcon className="text-primary mr-1 size-3" />
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
      </DialogContent>
    </Dialog>
  );
}
