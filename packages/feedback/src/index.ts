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

export const feedbackPayloadSchema = z.object({
  type: feedbackTypeSchema,
  message: z.string().trim().min(10).max(5000),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  pageUrl: z.string().trim().url().max(2048).optional(),
  userAgent: z.string().trim().max(500).optional(),
});

export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;

export function isFeedbackType(value: string | null): value is FeedbackType {
  if (value === null) return false;

  return feedbackTypeValues.some(type => type === value);
}
