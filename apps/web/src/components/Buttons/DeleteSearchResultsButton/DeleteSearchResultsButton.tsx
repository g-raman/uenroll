import { useDataParam } from "@/hooks/useDataParam";
import { useColoursActions } from "@/stores/colourStore";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import React, { useCallback } from "react";

export const DeleteSearchResultsButton = () => {
  const { resetColours } = useColoursActions();
  const [data, setData] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});

  const handleClick = useCallback(() => {
    resetColours();
    setData(null);
  }, [resetColours, setData]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="grow"
          variant="outline"
          size="lg"
          onClick={handleClick}
          disabled={courseCodes.length === 0}
        >
          <FontAwesomeIcon className="size-4" icon={faTrash} />
          <p className="hidden text-xs min-[375px]:inline sm:inline md:hidden min-[1440px]:inline">
            Clear
          </p>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Clear all search results</p>
      </TooltipContent>
    </Tooltip>
  );
};
