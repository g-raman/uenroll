import {
  getAvailableCoursesByTerm,
  getAvailableTerms,
  getCoursesByFilter,
  getCourse,
  processCourse,
} from "@repo/db/queries";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const supportEmailAddress = "support@uenroll.ca";

export const appRouter = router({
  getCourseByTermAndCourseCode: publicProcedure
    .input(
      z.object({
        term: z.string(),
        courseCode: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const course = await getCourse(input.term, input.courseCode, ctx.db);
      const processedCourse = processCourse(course);

      if (processedCourse.isErr()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: processedCourse.error.message,
        });
      }

      return processedCourse.value;
    }),
  getAvailableTerms: publicProcedure.query(async ({ ctx }) => {
    const terms = await getAvailableTerms(ctx.db);

    if (terms.isErr()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: terms.error.message,
      });
    }

    return terms.value;
  }),
  getAvailableCoursesByTerm: publicProcedure
    .input(z.object({ term: z.string() }))
    .query(async ({ ctx, input }) => {
      const availableCourses = await getAvailableCoursesByTerm(
        input.term,
        ctx.db,
      );

      if (availableCourses.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: availableCourses.error.message,
        });
      }

      return availableCourses.value;
    }),
  getCoursesByFilter: publicProcedure
    .input(
      z.object({
        term: z.string(),
        subject: z.string().trim().min(1).optional(),
        year: z.array(z.number().int().min(1).max(9)).optional(),
        language: z.array(z.enum(["english", "french", "other"])).optional(),
        limit: z.number().int().min(1).max(500).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const courses = await getCoursesByFilter(
        {
          term: input.term,
          subject: input.subject,
          year: input.year,
          language: input.language,
          limit: input.limit,
        },
        ctx.db,
      );

      if (courses.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: courses.error.message,
        });
      }

      return courses.value;
    }),
  sendFeedback: publicProcedure
    .input(
      z.object({
        type: z.enum(["feedback", "bug"]),
        message: z.string().trim().min(10).max(5000),
        email: z.string().trim().email().max(254).optional().or(z.literal("")),
        pageUrl: z.string().trim().url().max(2048).optional(),
        userAgent: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const replyTo = input.email || undefined;
      const typeLabel = input.type === "bug" ? "Bug report" : "Feedback";
      const submittedAt = new Date().toISOString();
      const text = [
        `${typeLabel} submitted from uEnroll`,
        "",
        `Submitted at: ${submittedAt}`,
        input.pageUrl ? `Page: ${input.pageUrl}` : null,
        input.userAgent ? `User agent: ${input.userAgent}` : null,
        replyTo ? `Reply to: ${replyTo}` : null,
        "",
        "Message:",
        input.message,
      ]
        .filter((line): line is string => line !== null)
        .join("\n");

      try {
        await ctx.supportEmail.send({
          from: supportEmailAddress,
          to: supportEmailAddress,
          subject: `[uEnroll] ${typeLabel}`,
          replyTo,
          text,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to send feedback right now.",
          cause: error,
        });
      }

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
