import { trpc } from "@/app/_trpc/client";
import { GC_TIME, STALE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

export const useAvailableTermsQuery = () => {
  return useQuery(
    trpc.getAvailableTerms.queryOptions(
      void { staleTime: STALE_TIME, gcTime: GC_TIME },
    ),
  );
};
