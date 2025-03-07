"use client";

import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Term } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import React, { ChangeEvent } from "react";
import toast from "react-hot-toast";

export default function TermSelector() {
  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["availableTerms"],
    queryFn: async () => {
      const res = await fetch("/api/v1/terms");
      if (!res.ok) {
        throw new Error("Something went wrong. Please report this error.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.data as Term[];
    },
  });
  const { state, dispatch } = useSearchResults();

  React.useEffect(() => {
    if (data && data.length > 0 && !state.term) {
      dispatch({ type: "initialize_term", payload: data[0] });
    }
  }, [data, dispatch, state.term]);

  if (isError) {
    toast.error(error.message);
  }

  function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
    const term = JSON.parse(event.target.value) as Term;
    dispatch({ type: "change_term", payload: term });
  }

  return (
    <>
      {isLoading ? (
        <div className="h-8 animate-pulse p-2 bg-slate-200 border-slate-400 border rounded-sm"></div>
      ) : (
        <select
          value={state.term ? JSON.stringify(state.term) : ""}
          onChange={handleSelect}
          className="w-full bg-slate-100 border-slate-400 border p-2 rounded-sm text-sm"
        >
          {isSuccess &&
            data?.map((elem) => (
              <option key={elem.value} value={JSON.stringify(elem)}>
                {elem.term}
              </option>
            ))}
        </select>
      )}
    </>
  );
}
