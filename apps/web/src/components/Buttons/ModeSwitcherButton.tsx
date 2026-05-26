import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

import { useMode, useUserSettingsActions } from "@/stores/modeStore";
import { Selected } from "@/types/Types";
import { useGeneratorActions } from "@/stores/generatorStore";
import { useDataParam } from "@/hooks/useDataParam";
import { useTranslation } from "react-i18next";

export const ModeSwitcherButton = () => {
  const isGenerationMode = useMode();
  const [data, setData] = useDataParam();
  const { resetSchedules } = useGeneratorActions();
  const { toggleMode } = useUserSettingsActions();
  const { t } = useTranslation();

  const handleToggle = () => {
    const courseCodes = Object.keys(data ? data : {});
    const newData: Selected = {};
    courseCodes.forEach(courseCode => (newData[courseCode] = []));
    setData(newData);
    resetSchedules();
    toggleMode();
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="lg"
            className="h-auto min-h-10 min-w-0 cursor-pointer gap-2 px-3 text-center text-xs leading-tight whitespace-normal"
            variant={isGenerationMode ? "default" : "outline"}
            aria-pressed={isGenerationMode}
            onClick={handleToggle}
          >
            <span
              className="size-2 shrink-0 rounded-full bg-current opacity-70"
              aria-hidden="true"
            />
            <span className="min-w-0 text-center">
              {isGenerationMode
                ? t("scheduleGeneration.on")
                : t("scheduleGeneration.off")}
            </span>
          </Button>
        }
      />

      <TooltipContent>
        {isGenerationMode
          ? t("scheduleGeneration.tooltip.on")
          : t("scheduleGeneration.tooltip.off")}
      </TooltipContent>
    </Tooltip>
  );
};
