import { useTRPC } from "@/router";
import { useColoursActions } from "@/stores/colourStore";
import { GC_TIME, STALE_TIME } from "@/utils/constants";
import { useQueries } from "@tanstack/react-query";

export const useCourseQueries = (
  term: string,
  courseCodes: string[],
  enabled: boolean,
) => {
  const { getColour } = useColoursActions();
  const trpc = useTRPC();
  const courseQueries = useQueries({
    queries: courseCodes.map(courseCode =>
      trpc.getCourseByTermAndCourseCode.queryOptions(
        { term, courseCode },
        {
          staleTime: STALE_TIME,
          gcTime: GC_TIME,
          enabled,
          select: course => ({ ...course, colour: getColour(courseCode) }),
        },
      ),
    ),
  });
  return courseQueries;
};
