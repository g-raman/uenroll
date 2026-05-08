export const YEAR_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "1st", value: "1" },
  { label: "2nd", value: "2" },
  { label: "3rd", value: "3" },
  { label: "4th", value: "4" },
  { label: "Grad", value: "5" },
] as const;

export const LANGUAGE_OPTIONS = [
  { label: "Any", value: "any", description: undefined },
  { label: "English", value: "english", description: undefined },
  { label: "French", value: "french", description: undefined },
  {
    label: "Other",
    value: "other",
    description: "Bilingual or other languages (e.g. Spanish)",
  },
] as const;

export const RESULTS_LIMIT = 200;

export type YearValue = (typeof YEAR_OPTIONS)[number]["value"];
export type LanguageValue = (typeof LANGUAGE_OPTIONS)[number]["value"];
