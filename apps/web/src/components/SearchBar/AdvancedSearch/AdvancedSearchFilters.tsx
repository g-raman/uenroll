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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {/* Subject input with integrated search */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="mb-1.5" htmlFor="subject-filter">
            {t("advancedSearch.subjectCode")}
          </Label>

          <Button
            variant="link"
            size="xs"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            tabIndex={hasActiveFilters ? undefined : -1}
            data-active={hasActiveFilters}
            className="invisible text-muted-foreground hover:text-primary disabled:opacity-0 data-[active=true]:visible"
          >
            <FilterXIcon className="size-3" />
            {t("advancedSearch.clearFilters")}
          </Button>
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
            {t("advancedSearch.search")}
          </Button>
        </div>
      </div>

      {/* Filter toggles */}
      <div className="flex gap-3">
        <div>
          <Label
            id="year-label"
            className="mb-1.5 text-xs tracking-wide text-muted-foreground uppercase"
          >
            {t("advancedSearch.year")}
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
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="aria-pressed:bg-primary/45 aria-pressed:text-primary-foreground"
              >
                {t(option.labelKey)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div>
          <Label
            id="language-label"
            className="mb-1.5 text-xs tracking-wide text-muted-foreground uppercase"
          >
            {t("advancedSearch.language")}
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
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="aria-pressed:bg-primary/45 aria-pressed:text-primary-foreground"
                >
                  {t(option.labelKey)}
                </ToggleGroupItem>
              );

              if (option.descriptionKey ? t(option.descriptionKey) : null) {
                return (
                  <Tooltip key={option.value}>
                    <TooltipTrigger render={toggle} />
                    <TooltipContent>
                      {option.descriptionKey ? t(option.descriptionKey) : null}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return toggle;
            })}
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
