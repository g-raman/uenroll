import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import React from "react";

export const DeleteSearchResultsButton = () => {
  const { state, dispatch } = useSearchResults();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => dispatch({ type: "reset_courses" })}
      disabled={state.courses.length === 0}
    >
      <FontAwesomeIcon className="size-4" icon={faTrash} />
      <p className="text-xs">Delete</p>
    </Button>
  );
};
