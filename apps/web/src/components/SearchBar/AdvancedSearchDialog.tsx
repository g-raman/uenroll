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
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

const YEAR_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "1st", value: "1" },
  { label: "2nd", value: "2" },
  { label: "3rd", value: "3" },
  { label: "4th", value: "4" },
  { label: "5th", value: "5" },
] as const;

const RESULTS_LIMIT = 200;

type YearValue = (typeof YEAR_OPTIONS)[number]["value"];

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

  const normalizedSubject = useMemo(
    () => subject.trim().toUpperCase().replace(/[^A-Z]/g, ""),
    [subject],
  );
  const yearFilter = year === "any" ? undefined : Number(year);
  const canSearch = Boolean(term) && (normalizedSubject.length > 0 || yearFilter);

  const { data: results, isLoading } = useQuery(
    trpc.getCoursesByFilter.queryOptions(
      {
        term,
        subject: normalizedSubject || undefined,
        year: yearFilter,
        limit: RESULTS_LIMIT,
      },
      { enabled: canSearch, staleTime: STALE_TIME },
    ),
  );

  const courses = results ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Advanced search</DialogTitle>
          <DialogDescription>
            Filter by subject and year, then add courses to your playground.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="subject-filter">
              Subject
            </label>
            <Input
              id="subject-filter"
              placeholder="ADM, CSI, ITI"
              value={subject}
              onChange={event => {
                setSubject(
                  event.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
                );
              }}
              autoComplete="off"
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Year</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
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
                  <span className="border-input bg-background text-muted-foreground peer-checked:text-foreground peer-checked:border-primary peer-checked:bg-primary/10 flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="grid gap-2">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {canSearch
                ? `${courses.length} result${courses.length === 1 ? "" : "s"}`
                : "Enter a subject or choose a year to search."}
            </span>
            {isAtLimit && (
              <span className="text-destructive">
                Max {MAX_RESULTS_ALLOWED} courses selected.
              </span>
            )}
          </div>

          <div className="border-input bg-muted/30 max-h-64 overflow-auto rounded-lg border">
            {!canSearch && (
              <div className="text-muted-foreground px-4 py-6 text-center text-sm">
                Start with a subject code or select a year to see results.
              </div>
            )}

            {canSearch && isLoading && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 px-4 py-6 text-sm">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Loading results...
              </div>
            )}

            {canSearch && !isLoading && courses.length === 0 && (
              <div className="text-muted-foreground px-4 py-6 text-center text-sm">
                No courses match those filters.
              </div>
            )}

            {canSearch && !isLoading && courses.length > 0 && (
              <ul className="flex flex-col divide-y">
                {courses.map(course => {
                  const alreadySelected = selectedCodes.has(course.courseCode);
                  const isDisabled = alreadySelected || isAdding || isAtLimit;
                  return (
                    <li
                      key={course.courseCode}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {course.courseCode}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {course.courseTitle}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => onAddCourse(course.courseCode)}
                      >
                        {alreadySelected ? (
                          <>
                            <CheckIcon className="mr-1 size-3" />
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
