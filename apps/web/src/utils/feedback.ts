import { z } from "zod";

export const feedbackTypeValues = [
  "feedback",
  "bug",
  "incorrect_info",
  "missing_info",
  "other",
] as const;

export type FeedbackType = (typeof feedbackTypeValues)[number];

export const feedbackTypeLabels = {
  feedback: "Feedback",
  bug: "Bug report",
  incorrect_info: "Incorrect info",
  missing_info: "Missing info",
  other: "Other",
} satisfies Record<FeedbackType, string>;

export const feedbackTypeOptions = feedbackTypeValues.map(value => ({
  value,
  label: feedbackTypeLabels[value],
}));

export const feedbackTypeSchema = z.enum(feedbackTypeValues);

export function isFeedbackType(value: string | null): value is FeedbackType {
  if (value === null) return false;

  return feedbackTypeValues.some(type => type === value);
}
