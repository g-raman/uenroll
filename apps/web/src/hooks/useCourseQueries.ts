import { trpc } from "@/app/_trpc/client";
import { useColoursActions } from "@/stores/colourStore";
import { useQueries } from "@tanstack/react-query";

export const useCourseQueries = (
  term: string,
  courseCodes: string[],
  enabled: boolean,
) => {
  const { getColour } = useColoursActions();
  const courseQueries = useQueries({
    queries: courseCodes.map(courseCode =>
      trpc.getCourse.queryOptions(
        { term, courseCode },
        {
          staleTime: 100_000,
          enabled,
          select: course => ({ ...course, colour: getColour(courseCode) }),
        },
      ),
    ),
  });
  return courseQueries;
};
