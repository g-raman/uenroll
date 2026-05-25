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
import {
  createDbQueryCacheKey,
  DB_QUERY_CACHE_TTL_SECONDS,
  getOrSetDbQueryCache,
} from "./cache";

export const appRouter = router({
  getCourseByTermAndCourseCode: publicProcedure
    .input(
      z.object({
        term: z.string(),
        courseCode: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getOrSetDbQueryCache({
        cache: ctx.cache,
        key: createDbQueryCacheKey("course-by-term-and-code", input),
        ttlSeconds: DB_QUERY_CACHE_TTL_SECONDS.courseByTermAndCode,
        fetcher: async () => {
          const course = await getCourse(input.term, input.courseCode, ctx.db);
          const processedCourse = processCourse(course);

          if (processedCourse.isErr()) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: processedCourse.error.message,
            });
          }

          return processedCourse.value;
        },
      });
    }),
  getAvailableTerms: publicProcedure.query(async ({ ctx }) => {
    return getOrSetDbQueryCache({
      cache: ctx.cache,
      key: createDbQueryCacheKey("available-terms"),
      ttlSeconds: DB_QUERY_CACHE_TTL_SECONDS.availableTerms,
      fetcher: async () => {
        const terms = await getAvailableTerms(ctx.db);

        if (terms.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: terms.error.message,
          });
        }

        return terms.value;
      },
    });
  }),
  getAvailableCoursesByTerm: publicProcedure
    .input(z.object({ term: z.string() }))
    .query(async ({ ctx, input }) => {
      return getOrSetDbQueryCache({
        cache: ctx.cache,
        key: createDbQueryCacheKey("available-courses-by-term", input),
        ttlSeconds: DB_QUERY_CACHE_TTL_SECONDS.availableCoursesByTerm,
        fetcher: async () => {
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
        },
      });
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
      return getOrSetDbQueryCache({
        cache: ctx.cache,
        key: createDbQueryCacheKey("courses-by-filter", input),
        ttlSeconds: DB_QUERY_CACHE_TTL_SECONDS.coursesByFilter,
        fetcher: async () => {
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
        },
      });
    }),
});

export type AppRouter = typeof appRouter;
