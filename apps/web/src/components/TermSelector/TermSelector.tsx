"use client";

import {
  useAvailableTerms,
  useScheduleActions,
  useSelectedTerm,
} from "@/stores/scheduleStore";
import { Term } from "@/types/Types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function TermSelector() {
  const availableTerms = useAvailableTerms();
  const selectedTerm = useSelectedTerm();
  const { changeTerm } = useScheduleActions();

  function handleSelect(event: string) {
    const term = JSON.parse(event) as Term;
    changeTerm(term);
  }

  return (
    <>
      {availableTerms.length === 0 ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <Select
          defaultValue={selectedTerm ? JSON.stringify(selectedTerm) : ""}
          onValueChange={handleSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Term" />
          </SelectTrigger>

          <SelectContent>
            {availableTerms.map(elem => (
              <SelectItem key={elem.value} value={JSON.stringify(elem)}>
                {elem.term}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
}
