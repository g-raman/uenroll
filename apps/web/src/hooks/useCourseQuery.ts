import { trpc } from "@/app/_trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useTermParam } from "./useTermParam";
import { GC_TIME, STALE_TIME } from "@/utils/constants";

export const useCourseQuery = (
  courseCode: string,
  isUnderMaxResults: boolean,
) => {
  const [selectedTerm] = useTermParam();

  return useQuery(
    trpc.getCourseByTermAndCourseCode.queryOptions(
      { term: selectedTerm, courseCode },
      {
        enabled: isUnderMaxResults ? !!courseCode : false,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        // Necessary since tanstack query will only check the enabled
        // condition if the query isn't cached
        select: data => {
          if (!isUnderMaxResults) {
            return undefined;
          }
          return data;
        },
      },
    ),
  );
};
