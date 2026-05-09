import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
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
          <div className="flex items-center space-x-2">
            <Switch
              id="generation-mode"
              className="cursor-pointer"
              checked={isGenerationMode}
              onCheckedChange={handleToggle}
            />
            <Label
              className="w-min cursor-pointer text-xs md:w-max lg:text-sm"
              htmlFor="generation-mode"
            >
              Schedule Generation
            </Label>
          </div>
        }
      />

      <TooltipContent>
        Turn this on to automatically generate all possible schedules
      </TooltipContent>
    </Tooltip>
  );
};
