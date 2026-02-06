import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
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
  year: YearValue;
  onYearChange: (value: YearValue) => void;
  language: LanguageValue;
  onLanguageChange: (value: LanguageValue) => void;
  canSearch: boolean;
  hasActiveFilters: boolean;
  onSearch: () => void;
  onClearFilters: () => void;
};

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
              onClick={onClearFilters}
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
      <div className="grid gap-3">
        <fieldset>
          <legend className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
            Year
          </legend>

          <RadioGroup
            value={year}
            onValueChange={value => onYearChange(value as YearValue)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {YEAR_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center gap-1.5">
                <RadioGroupItem value={option.value} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {option.label}
                </span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset>
          <legend className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
            Language
          </legend>

          <RadioGroup
            value={language}
            onValueChange={value => onLanguageChange(value as LanguageValue)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {LANGUAGE_OPTIONS.map(option => {
              const radio = (
                <label key={option.value} className="flex items-center gap-1.5">
                  <RadioGroupItem value={option.value} />
                  <span className="text-xs font-medium whitespace-nowrap">
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
          </RadioGroup>
        </fieldset>
      </div>
    </div>
  );
}
