"use client"

import { useSearchResults } from "@/contexts/SearchResultsContext"
import { Term } from "@/types/Types"
import React, { ChangeEvent } from "react"

export default function TermSelector() {
  const { state, dispatch } = useSearchResults()

  function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
    const term = JSON.parse(event.target.value) as Term
    dispatch({ type: "change_term", payload: term })
  }

  return (
    <>
      {state.availableTerms.length === 0 ? (
        <div className="h-8 animate-pulse rounded-xs border border-slate-400 bg-slate-200 p-2"></div>
      ) : (
        <select
          value={state.term ? JSON.stringify(state.term) : ""}
          onChange={handleSelect}
          className="w-full cursor-pointer rounded-xs border border-slate-400 bg-slate-100 p-2 text-sm"
        >
          {state.availableTerms.map(elem => (
            <option key={elem.value} value={JSON.stringify(elem)}>
              {elem.term}
            </option>
          ))}
        </select>
      )}
    </>
  )
}
