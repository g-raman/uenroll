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
        <div className="rounded-xs h-8 animate-pulse border border-slate-400 bg-slate-200 p-2"></div>
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
