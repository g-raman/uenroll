import { useTRPC } from "@/router";
import { GC_TIME, STALE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

export const useAvailableTermsQuery = () => {
  const trpc = useTRPC();

  return useQuery(
    trpc.getAvailableTerms.queryOptions(
      void { staleTime: STALE_TIME, gcTime: GC_TIME },
    ),
  );
};
