import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
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
      <div className="flex flex-col gap-3">
        <div>
          <Label
            id="year-label"
            className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase"
          >
            Year
          </Label>

          <RadioGroup
            aria-labelledby="year-label"
            value={year}
            onValueChange={value => onYearChange(value as YearValue)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {YEAR_OPTIONS.map(option => (
              <Label key={option.value} className="gap-1.5">
                <RadioGroupItem value={option.value} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label
            id="language-label"
            className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase"
          >
            Language
          </Label>
          <RadioGroup
            aria-labelledby="language-label"
            value={language}
            onValueChange={value => onLanguageChange(value as LanguageValue)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {LANGUAGE_OPTIONS.map(option => {
              const radio = (
                <Label key={option.value} className="gap-1.5">
                  <RadioGroupItem value={option.value} />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {option.label}
                  </span>
                </Label>
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
        </div>
      </div>
    </div>
  );
}
