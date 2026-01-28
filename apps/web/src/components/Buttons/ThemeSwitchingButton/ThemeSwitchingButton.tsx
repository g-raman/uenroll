"use client";

import { useTheme } from "next-themes";

import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

export function ThemeSwitchingButton() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="size-10 cursor-pointer"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />

      <TooltipContent>
        Change to {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}
