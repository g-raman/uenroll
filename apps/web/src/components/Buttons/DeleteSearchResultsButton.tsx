import { useDataParam } from "@/hooks/useDataParam";
import { useColoursActions } from "@/stores/colourStore";
import { useGeneratorActions } from "@/stores/generatorStore";
import { Trash2 } from "lucide-react";
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
  const { resetSchedules } = useGeneratorActions();

  const handleClick = useCallback(() => {
    resetColours();
    setData(null);
    resetSchedules();
  }, [resetColours, resetSchedules, setData]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="grow"
            variant="outline"
            size="lg"
            onClick={handleClick}
            disabled={courseCodes.length === 0}
          >
            <Trash2 className="size-4" />
            <p className="text-xs">Clear Results</p>
          </Button>
        }
      />

      <TooltipContent>
        <p>Clear all search results</p>
      </TooltipContent>
    </Tooltip>
  );
};
