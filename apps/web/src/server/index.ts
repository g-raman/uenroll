import { getCourse, processCourse } from "@repo/db/queries";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { CourseSearchResult } from "@repo/db/types";
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
});

export type AppRouter = typeof appRouter;
