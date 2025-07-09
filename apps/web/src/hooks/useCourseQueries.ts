import { trpc } from "@/app/_trpc/client";
import { useColoursActions } from "@/stores/colourStore";
import { COURSE_GC_TIME, COURSE_STALE_TIME } from "@/utils/constants";
import { useQueries } from "@tanstack/react-query";

export const useCourseQueries = (
  term: string,
  courseCodes: string[],
  enabled: boolean,
) => {
  const { getColour } = useColoursActions();
  const courseQueries = useQueries({
    queries: courseCodes.map(courseCode =>
      trpc.getCourseByTermAndCourseCode.queryOptions(
        { term, courseCode },
        {
          staleTime: COURSE_STALE_TIME,
          gcTime: COURSE_GC_TIME,
          enabled,
          select: course => ({ ...course, colour: getColour(courseCode) }),
        },
      ),
    ),
  });
  return courseQueries;
};
