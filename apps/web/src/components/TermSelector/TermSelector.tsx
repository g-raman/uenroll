"use client";

import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Term } from "@/types/Types";
import React, { ChangeEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

export default function TermSelector() {
  const { state, dispatch } = useSearchResults();

  function handleSelect(event: string) {
    const term = JSON.parse(event) as Term;
    dispatch({ type: "change_term", payload: term });
  }

  return (
    <>
      {state.availableTerms.length === 0 ? (
        <div className="rounded-xs h-8 animate-pulse border border-slate-400 bg-slate-200 p-2"></div>
      ) : (
        <Select
          defaultValue={state.term ? JSON.stringify(state.term) : ""}
          onValueChange={handleSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Term" />
          </SelectTrigger>

          <SelectContent>
            {state.availableTerms.map(elem => (
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
