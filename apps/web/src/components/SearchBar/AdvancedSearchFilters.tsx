import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { SearchIcon, FilterXIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import {
  YEAR_OPTIONS,
  LANGUAGE_OPTIONS,
  type YearValue,
  type LanguageValue,
} from "./advanced-search-constants";

type AdvancedSearchFiltersProps = {
  subject: string;
  onSubjectChange: (value: string) => void;
  year: YearValue[];
  onYearChange: (value: YearValue[]) => void;
  language: LanguageValue[];
  onLanguageChange: (value: LanguageValue[]) => void;
  canSearch: boolean;
  hasActiveFilters: boolean;
  onSearch: () => void;
  onClearFilters: () => void;
};

function getExclusiveAnyValues<T extends string>(
  nextValue: string[],
  currentValue: T[],
) {
  if (nextValue.length === 0) {
    return ["any"] as T[];
  }

  if (nextValue.includes("any") && !currentValue.includes("any" as T)) {
    return ["any"] as T[];
  }

  return nextValue.filter(value => value !== "any") as T[];
}

export function AdvancedSearchFilters({
  subject,
  onSubjectChange,
  year,
  onYearChange,
  language,
  onLanguageChange,
  canSearch,
  hasActiveFilters,
  onSearch,
  onClearFilters,
}: AdvancedSearchFiltersProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Subject input with integrated search */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="mb-1.5" htmlFor="subject-filter">
            Subject code
          </Label>

          {hasActiveFilters && (
            <Button
              variant="link"
              size="xs"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <FilterXIcon className="size-3" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            id="subject-filter"
            placeholder="e.g. ADM, CSI, ITI..."
            value={subject}
            onChange={event => {
              onSubjectChange(
                event.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
              );
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="min-w-0 flex-1"
          />

          <Button size="default" disabled={!canSearch} onClick={onSearch}>
            <SearchIcon className="mr-1.5 size-3.5" />
            Search
          </Button>
        </div>
      </div>

      {/* Filter toggles */}
      <div className="flex gap-3">
        <div>
          <Label
            id="year-label"
            className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase"
          >
            Year
          </Label>

          <ToggleGroup
            aria-labelledby="year-label"
            multiple
            value={year}
            onValueChange={value => {
              onYearChange(getExclusiveAnyValues<YearValue>(value, year));
            }}
            variant="outline"
            size="sm"
            spacing={1}
            className="flex-wrap"
          >
            {YEAR_OPTIONS.map(option => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <Label
            id="language-label"
            className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase"
          >
            Language
          </Label>
          <ToggleGroup
            aria-labelledby="language-label"
            multiple
            value={language}
            onValueChange={value => {
              onLanguageChange(
                getExclusiveAnyValues<LanguageValue>(value, language),
              );
            }}
            variant="outline"
            size="sm"
            spacing={1}
            className="flex-wrap"
          >
            {LANGUAGE_OPTIONS.map(option => {
              const toggle = (
                <ToggleGroupItem value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              );

              if (option.description) {
                return (
                  <Tooltip key={option.value}>
                    <TooltipTrigger render={toggle} />
                    <TooltipContent>{option.description}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
