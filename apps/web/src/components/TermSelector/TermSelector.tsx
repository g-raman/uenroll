"use client";

import { trpc } from "@/app/_trpc/client";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function TermSelector() {
  const [selectedTerm, setSelectedTerm] = useTermParam();
  const [, setData] = useDataParam();
  const { data: availableTerms } = useQuery(
    trpc.getAvailableTerms.queryOptions(),
  );

  function handleChangeTerm(term: string) {
    setSelectedTerm(term);
    setData(null);
  }

  return (
    <>
      {!availableTerms || availableTerms.length === 0 ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <Select defaultValue={selectedTerm} onValueChange={handleChangeTerm}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Term" />
          </SelectTrigger>

          <SelectContent>
            {availableTerms.map(availableTerm => (
              <SelectItem key={availableTerm.value} value={availableTerm.value}>
                {availableTerm.term}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
}
