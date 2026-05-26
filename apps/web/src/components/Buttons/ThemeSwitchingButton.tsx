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
import { cn } from "@repo/ui/lib/utils";

type ThemeSwitchingButtonProps = {
  className?: string;
};

export function ThemeSwitchingButton({ className }: ThemeSwitchingButtonProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
            className={cn("w-full justify-center", className)}
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