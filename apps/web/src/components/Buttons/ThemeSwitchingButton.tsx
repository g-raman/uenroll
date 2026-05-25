import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useTranslation } from "react-i18next";

export function ThemeSwitchingButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run once and state isn't used elsewhere
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const Icon = mounted && resolvedTheme === "dark" ? Sun : Moon;
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="size-10"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
          >
            <Icon />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />

      <TooltipContent>
        {resolvedTheme === "dark"
          ? t("theme.switchToLight")
          : t("theme.switchToDark")}
      </TooltipContent>
    </Tooltip>
  );
}
