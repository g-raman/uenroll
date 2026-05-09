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

export const ModeSwitcherButton = () => {
  const isGenerationMode = useMode();
  const [data, setData] = useDataParam();
  const { resetSchedules } = useGeneratorActions();
  const { toggleMode } = useUserSettingsActions();

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
            className="cursor-pointer gap-2 px-3 text-xs"
            variant={isGenerationMode ? "default" : "outline"}
            aria-pressed={isGenerationMode}
            onClick={handleToggle}
          >
            <span
              className="size-2 rounded-full bg-current opacity-70"
              aria-hidden="true"
            />
            {isGenerationMode
              ? "Schedule Generation on"
              : "Schedule Generation off"}
          </Button>
        }
      />

      <TooltipContent>
        {isGenerationMode
          ? "Switch back to manual section selection"
          : "Automatically generate all possible schedules"}
      </TooltipContent>
    </Tooltip>
  );
};
