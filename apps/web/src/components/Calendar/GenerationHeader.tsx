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
import {
  faBuildingColumns,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { useMode, useModeActions } from "@/stores/modeStore";
import { ChangeEvent, useRef, useState } from "react";
import { Selected } from "@/types/Types";
import {
  filterCoursesWithVirutalSessions,
  sortCoursesByNumSubSections,
} from "@/utils/course";
import { toast } from "sonner";

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
  const { toggleMode } = useModeActions();
  const excluded = useExcluded();

  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();
  const noSchedules = schedules.length <= 0;

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

      if (result.length === 0) {
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
    <div className="bg-background sticky top-0 z-10 flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-center justify-start text-4xl">
        <FontAwesomeIcon
          className="text-primary size-12"
          icon={faBuildingColumns}
        />
        <p>uEnroll</p>
      </div>

      {isGenerationMode && (
        <div className="flex gap-2">
          <div className="flex items-center">
            <Button
              disabled={noSchedules}
              className="w-6 rounded-e-none border-e-[0px]"
              variant="outline"
              onClick={handlePrevious}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>

            <div className="flex h-full items-center">
              <Input
                onChange={handleInputChange}
                className="!max-w-28 rounded-none text-center"
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
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>

          <Button
            disabled={loading || courseSearchResults.length <= 0}
            variant="default"
            onClick={handleGeneration}
          >
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>
      )}

      <div className="ms-4 flex items-center space-x-2">
        <Switch
          id="generation-mode"
          checked={isGenerationMode}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="airplane-mode">Generation Mode</Label>
      </div>
    </div>
  );
}
