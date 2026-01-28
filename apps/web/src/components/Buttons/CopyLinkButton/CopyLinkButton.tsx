"use client";

import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import { parseAsSelectedSessions } from "@/hooks/utils";
import { useSchedules, useSelectedSchedule } from "@/stores/generatorStore";
import { useMode } from "@/stores/modeStore";
import { scheduleToSelected } from "@/utils/mappers/schedule";
import { Check, Link } from "lucide-react";
import { envClient } from "@repo/env/client";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { ResultAsync } from "neverthrow";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

export const CopyLinkButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  let newSelected = data ? { ...data } : {};

  const isGenerationMode = useMode();
  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();

  if (
    isGenerationMode &&
    selectedSchedule !== null &&
    schedules[selectedSchedule]
  ) {
    newSelected = scheduleToSelected(schedules[selectedSchedule]);
  } else {
    Object.keys(newSelected).forEach(key => {
      if (newSelected[key] && newSelected[key].length === 0) {
        delete newSelected[key];
      }
    });
  }

  const serialized = parseAsSelectedSessions.serialize(newSelected);

  const hasAnySelectedSessions = data
    ? Object.values(data).some(value => value.length > 0)
    : false;

  const handleClick = useCallback(async () => {
    const clipboardAppendResult = await ResultAsync.fromPromise(
      navigator.clipboard.writeText(
        `${envClient.NEXT_PUBLIC_BASE_URL}/?term=${selectedTerm}&data=${serialized}`,
      ),
      error => new Error(`Failed to copy url: ${error}`),
    );
    if (clipboardAppendResult.isErr()) {
      console.error(clipboardAppendResult.error);
      toast.error("Failed to copy URL. Please report this error.");
      return;
    }
    toast.success("Copied URL!");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [selectedTerm, serialized]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="cursor-pointer"
            variant="outline"
            size="icon-lg"
            disabled={
              (isGenerationMode && schedules.length === 0) ||
              (!isGenerationMode && !hasAnySelectedSessions)
            }
            onClick={handleClick}
          >
            {isCopied ? (
              <Check className="size-4" />
            ) : (
              <Link className="size-4" />
            )}
            <p className="hidden text-xs min-[1440px]:inline sm:inline md:hidden">
              {isCopied ? "Copied" : "Copy Link"}
            </p>
          </Button>
        }
      />
      <TooltipContent>
        <p>Copy the link for this schedule</p>
      </TooltipContent>
    </Tooltip>
  );
};
