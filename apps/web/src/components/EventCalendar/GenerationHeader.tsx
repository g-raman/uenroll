"use client";

import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import {
  useExcluded,
  useGeneratorActions,
  useSchedules,
  useSelectedSchedule,
} from "@/stores/generatorStore";
import {
  courseToCourseWithSectionAlternatives,
  filterExcludedSections,
} from "@/utils/mappers/course";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { useMode, useUserSettingsActions } from "@/stores/modeStore";
import { ChangeEvent, useRef, useState } from "react";
import { Selected } from "@/types/Types";
import {
  filterCoursesWithVirutalSessions,
  sortCoursesByNumSubSections,
} from "@/utils/course";
import { toast } from "sonner";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

export function GenerationHeader() {
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const [selectedTerm] = useTermParam();
  const [data, setData] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const isGenerationMode = useMode();
  const { toggleMode } = useUserSettingsActions();
  const excluded = useExcluded();

  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();
  const noSchedules = schedules.length <= 0;
  const { width } = useScreenSize();

  const {
    previousSchedule,
    nextSchedule,
    setSelectedSchedule,
    setSchedules,
    resetSchedules,
  } = useGeneratorActions();

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const handleGeneration = async () => {
    setSchedules([]);
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../../utils/generatorWorker.js", import.meta.url),
        { type: "module" },
      );
    }

    const worker = workerRef.current;
    setLoading(true);

    worker.onmessage = e => {
      const { ok, result } = e.data;
      setLoading(false);
      if (!ok) return;

      // result[0] will be empty if there are search results but all components are unchecked
      if (result.length === 0 || result[0].length === 0) {
        toast.error("No Possible Schedules. Adjust filters or remove courses.");
        return;
      }
      setSchedules(result);
    };

    const filteredVirtual =
      filterCoursesWithVirutalSessions(courseSearchResults);
    const filteredExcluded = filteredVirtual.map(result =>
      filterExcludedSections(result, excluded),
    );
    const coursesWithAlternatives = filteredExcluded.map(result =>
      courseToCourseWithSectionAlternatives(result),
    );
    sortCoursesByNumSubSections(coursesWithAlternatives);

    worker.postMessage({ input: coursesWithAlternatives });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Allow only digits and empty string
    if (/^\d*$/.test(value)) {
      const num = Number(value);

      if (value === "") setSelectedSchedule(null);
      else if (num >= 1 && num <= schedules.length)
        setSelectedSchedule(num - 1);
    }
  };

  const handlePrevious = () => {
    if (noSchedules) return;
    if (selectedSchedule === null) {
      setSelectedSchedule(0);
      return;
    }

    previousSchedule();
  };

  const handleNext = () => {
    if (noSchedules) return;
    if (selectedSchedule === null) {
      setSelectedSchedule(schedules.length - 1);
      return;
    }

    nextSchedule();
  };

  const handleToggle = () => {
    const courseCodes = Object.keys(data ? data : {});
    const newData: Selected = {};
    courseCodes.forEach(courseCode => (newData[courseCode] = []));
    setData(newData);
    resetSchedules();
    toggleMode();
  };

  return (
    <div className="bg-background sticky top-0 z-10 flex items-center justify-between gap-2 rounded-b-md p-2">
      {width && width >= 1024 && (
        <div className="flex items-center justify-start gap-2 text-4xl">
          <svg
            className="text-primary size-12 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path d="M335.9 84.2C326.1 78.6 314 78.6 304.1 84.2L80.1 212.2C67.5 219.4 61.3 234.2 65 248.2C68.7 262.2 81.5 272 96 272L128 272L128 480L128 480L76.8 518.4C68.7 524.4 64 533.9 64 544C64 561.7 78.3 576 96 576L544 576C561.7 576 576 561.7 576 544C576 533.9 571.3 524.4 563.2 518.4L512 480L512 272L544 272C558.5 272 571.2 262.2 574.9 248.2C578.6 234.2 572.4 219.4 559.8 212.2L335.8 84.2zM464 272L464 480L400 480L400 272L464 272zM352 272L352 480L288 480L288 272L352 272zM240 272L240 480L176 480L176 272L240 272zM320 160C337.7 160 352 174.3 352 192C352 209.7 337.7 224 320 224C302.3 224 288 209.7 288 192C288 174.3 302.3 160 320 160z" />
          </svg>
          <p>uEnroll</p>
        </div>
      )}

      {isGenerationMode && (
        <div className="flex gap-2">
          <div className="flex items-center">
            <Button
              disabled={noSchedules}
              className="w-6 rounded-e-none border-e-[0px]"
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex h-full items-center">
              <Input
                onChange={handleInputChange}
                className="!max-w-8 rounded-none text-center text-xs lg:!max-w-28 lg:text-sm"
                disabled={noSchedules}
                value={
                  noSchedules
                    ? `No results`
                    : selectedSchedule !== null
                      ? selectedSchedule + 1
                      : ""
                }
              />
              {!noSchedules && (
                <span className="bg-muted border-input flex h-full items-center border-y px-2 text-sm text-gray-500">
                  of {schedules.length}
                </span>
              )}
            </div>

            <Button
              disabled={noSchedules}
              className="w-6 rounded-s-none border-s-[0px]"
              variant="outline"
              onClick={handleNext}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            disabled={loading || courseSearchResults.length <= 0}
            variant="default"
            className="px-2 text-xs lg:text-sm"
            onClick={handleGeneration}
          >
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Switch
              id="generation-mode"
              checked={isGenerationMode}
              onCheckedChange={handleToggle}
            />
            <Label
              className="w-min text-xs md:w-max lg:text-sm"
              htmlFor="generation-mode"
            >
              Schedule Generation
            </Label>
          </div>
        </TooltipTrigger>

        <TooltipContent>
          Turn this on to automatically generate all possible schedules
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
