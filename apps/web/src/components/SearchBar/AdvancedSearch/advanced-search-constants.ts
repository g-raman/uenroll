export const YEAR_OPTIONS = [
  { labelKey: "advancedSearch.any", value: "any" },
  { labelKey: "advancedSearch.years.first", value: "1" },
  { labelKey: "advancedSearch.years.second", value: "2" },
  { labelKey: "advancedSearch.years.third", value: "3" },
  { labelKey: "advancedSearch.years.fourth", value: "4" },
  { labelKey: "advancedSearch.years.grad", value: "5" }
] as const;

export const LANGUAGE_OPTIONS = [
  { labelKey: "advancedSearch.any", value: "any", descriptionKey: undefined },
  { labelKey: "advancedSearch.languages.english", value: "english", descriptionKey: undefined },
  { labelKey: "advancedSearch.languages.french", value: "french", descriptionKey: undefined },
  {
    labelKey: "advancedSearch.languages.other",
    value: "other",
    descriptionKey: "advancedSearch.languageDescriptions.other",
  },
] as const;

export const RESULTS_LIMIT = 200;

export type YearValue = (typeof YEAR_OPTIONS)[number]["value"];
export type LanguageValue = (typeof LANGUAGE_OPTIONS)[number]["value"];
