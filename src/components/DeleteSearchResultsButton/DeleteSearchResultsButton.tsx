import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export const DeleteSearchResultsButton = () => {
  const { dispatch } = useSearchResults();

  return (
    <button
      onClick={() => dispatch({ type: "reset_courses" })}
      className="cursor-pointer flex gap-1 justify-center items-center w-full border-slate-400 border py-3 px-2 h-full rounded-xs text-black"
    >
      <FontAwesomeIcon className="size-4" icon={faTrash} />
      <p className="text-xs ">Delete</p>
    </button>
  );
};
