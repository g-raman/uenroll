import {
  getAvailableCoursesByTerm,
  getAvailableTerms,
  getCourse,
  getCourses,
  processCourse,
  processCourses,
} from "@repo/db/queries";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  getCourse: publicProcedure
    .input(
      z.object({
        term: z.string(),
        courseCode: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const course = await getCourse(input.term, input.courseCode);
      const processedCourse = processCourse(course);

      if (processedCourse.isErr()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: processedCourse.error.message,
        });
      }

      return processedCourse.value;
    }),
  getCourses: publicProcedure
    .input(
      z.object({
        term: z.string(),
        courseCodes: z.array(z.string()),
      }),
    )
    .query(async ({ input }) => {
      const courses = await getCourses(input.term, input.courseCodes);
      const processedCourses = await processCourses(courses);

      if (processedCourses.isErr()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: processedCourses.error.message,
        });
      }

      return processedCourses.value;
    }),
  getTerms: publicProcedure.query(async () => {
    const terms = await getAvailableTerms();

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
    .query(async ({ input }) => {
      const availableCourses = await getAvailableCoursesByTerm(input.term);

      if (availableCourses.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: availableCourses.error.message,
        });
      }

      return availableCourses.value;
    }),
});

export type AppRouter = typeof appRouter;
