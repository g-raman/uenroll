import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export const DeleteSearchResultsButton = (props: {}) => {
  const { dispatch } = useSearchResults();

  return (
    <button
      onClick={() => dispatch({ type: "reset_courses" })}
      className="text-sm flex gap-2 justify-center items-center w-full border-slate-400 border p-2 h-full rounded-xs text-black"
    >
      <p>Clear Results</p>
      <FontAwesomeIcon className="size-4" icon={faTrash} />
    </button>
  );
};
