import { trpc } from "@/app/_trpc/client";
import { COURSE_GC_TIME, COURSE_STALE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

export const useAvailableTermsQuery = () => {
  return useQuery(
    trpc.getAvailableTerms.queryOptions(
      void { staleTime: COURSE_STALE_TIME, gcTime: COURSE_GC_TIME },
    ),
  );
};
