"use client";

import { trpc } from "@/app/_trpc/client";
import { STALE_TIME } from "@/utils/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  RESULTS_LIMIT,
  type YearValue,
  type LanguageValue,
} from "./advanced-search-constants";
import { AdvancedSearchFilters } from "./AdvancedSearchFilters";
import { AdvancedSearchResults } from "./AdvancedSearchResults";

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
  const canSearch = Boolean(term) && normalizedSubject.length > 0;
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

        <AdvancedSearchFilters
          subject={subject}
          onSubjectChange={setSubject}
          year={year}
          onYearChange={setYear}
          language={language}
          onLanguageChange={setLanguage}
          canSearch={canSearch}
          hasActiveFilters={hasActiveFilters}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
        />

        {/* Divider */}
        <div className="bg-border -mx-6 h-px" />

        <AdvancedSearchResults
          hasSubmitted={hasSubmitted}
          isLoading={isLoading}
          canSearch={canSearch}
          courses={courses}
          selectedCodes={selectedCodes}
          isAdding={isAdding}
          isAtLimit={isAtLimit}
          onAddCourse={onAddCourse}
        />
      </DialogContent>
    </Dialog>
  );
}
