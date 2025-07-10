import { useAvailableTermsQuery } from "@/hooks/useAvailableTermsQuery";
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
import { useCallback, useEffect } from "react";

export default function TermSelector() {
  const [selectedTerm, setSelectedTerm] = useTermParam();
  const [, setData] = useDataParam();
  const { data: availableTerms } = useAvailableTermsQuery();

  const handleChangeTerm = useCallback(
    (term: string) => {
      setSelectedTerm(term);
      setData(null);
    },
    [setData, setSelectedTerm],
  );

  useEffect(() => {
    if (!availableTerms || availableTerms.length === 0) return;

    const termInUrl = selectedTerm
      ? availableTerms.find(
          availableTerm => availableTerm.value === selectedTerm,
        )
      : null;

    if (!termInUrl) {
      setSelectedTerm(availableTerms[0]?.value as string);
      setData(null);
    }
  }, [availableTerms, selectedTerm, setSelectedTerm, setData]);

  return (
    <>
      {!selectedTerm || !availableTerms || availableTerms.length === 0 ? (
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
