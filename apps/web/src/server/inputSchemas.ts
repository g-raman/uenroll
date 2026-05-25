import { z } from "zod";

export const courseByTermAndCodeInputSchema = z.object({
  term: z.string(),
  courseCode: z.string(),
});

export const availableCoursesByTermInputSchema = z.object({
  term: z.string(),
});

export const coursesByFilterInputSchema = z.object({
  term: z.string(),
  subject: z.string().trim().min(1).optional(),
  year: z.array(z.number().int().min(1).max(9)).optional(),
  language: z.array(z.enum(["english", "french", "other"])).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export type CourseByTermAndCodeInput = z.infer<
  typeof courseByTermAndCodeInputSchema
>;
export type AvailableCoursesByTermInput = z.infer<
  typeof availableCoursesByTermInputSchema
>;
export type CoursesByFilterInput = z.infer<typeof coursesByFilterInputSchema>;
