import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export const DeleteSearchResultsButton = (props: {}) => {
  const { resetCourses } = useSearchResults();

  return (
    <button
      onClick={resetCourses}
      className="w-full border-slate-400 border p-2 h-full rounded-md text-black"
    >
      <FontAwesomeIcon className="size-4" icon={faTrash} />
    </button>
  );
};
