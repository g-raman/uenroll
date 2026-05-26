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
import { useTranslation } from "react-i18next";

export const DeleteSearchResultsButton = () => {
  const { resetColours } = useColoursActions();
  const [data, setData] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});
  const { resetSchedules } = useGeneratorActions();
  const { t } = useTranslation();

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
            className="h-auto min-h-10 w-full min-w-0 px-3 text-center text-xs leading-tight whitespace-normal"
            variant="outline"
            size="lg"
            onClick={handleClick}
            disabled={courseCodes.length === 0}
          >
            <Trash2 className="size-4 shrink-0" />
            <span className="min-w-0 text-center">
              {t("clearResults.button")}
            </span>
          </Button>
        }
      />

      <TooltipContent>
        <p>{t("clearResults.tooltip")}</p>
      </TooltipContent>
    </Tooltip>
  );
};
