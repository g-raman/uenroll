import { useSearchResults } from "@/contexts/SearchResultsContext";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import React from "react";

export const DeleteSearchResultsButton = () => {
  const { state, dispatch } = useSearchResults();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="grow"
          variant="outline"
          size="lg"
          onClick={() => dispatch({ type: "reset_courses" })}
          disabled={state.courses.length === 0}
        >
          <FontAwesomeIcon className="size-4" icon={faTrash} />
          <p className="hidden text-xs xl:inline">Clear</p>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Clear all search results</p>
      </TooltipContent>
    </Tooltip>
  );
};
