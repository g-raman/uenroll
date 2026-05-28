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
import { Input } from "@repo/ui/components/input";
import { useMode } from "@/stores/modeStore";
import { ChangeEvent, useRef, useState } from "react";
import {
  filterCoursesWithVirutalSessions,
  sortCoursesByNumSubSections,
} from "@/utils/course";
import { toast } from "sonner";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ThemeSwitchingButton } from "@/components/Buttons/ThemeSwitchingButton";
import { useTranslation } from "react-i18next";
import { LanguageSwitcherButton } from "../Buttons/LanguageSwitcherButton";
import { AboutButton } from "@/components/Buttons/AboutButton";

export function GenerationHeader() {
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const isGenerationMode = useMode();
  const excluded = useExcluded();

  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();
  const noSchedules = schedules.length <= 0;
  const { width } = useScreenSize();

  const { previousSchedule, nextSchedule, setSelectedSchedule, setSchedules } =
    useGeneratorActions();

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const handleGeneration = async () => {
    if (!isGenerationMode) return;

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
        toast.error(t("scheduleGeneration.noSchedules"));
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
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-10 flex w-full min-w-0 items-center justify-between gap-4 rounded-b-lg border-b bg-background px-4 py-3 lg:rounded-lg lg:border">
      {width && width >= 1024 && (
        <div className="flex shrink-0 items-center justify-start gap-2 text-4xl">
          <svg
            className="size-12 fill-current text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path d="M335.9 84.2C326.1 78.6 314 78.6 304.1 84.2L80.1 212.2C67.5 219.4 61.3 234.2 65 248.2C68.7 262.2 81.5 272 96 272L128 272L128 480L128 480L76.8 518.4C68.7 524.4 64 533.9 64 544C64 561.7 78.3 576 96 576L544 576C561.7 576 576 561.7 576 544C576 533.9 571.3 524.4 563.2 518.4L512 480L512 272L544 272C558.5 272 571.2 262.2 574.9 248.2C578.6 234.2 572.4 219.4 559.8 212.2L335.8 84.2zM464 272L464 480L400 480L400 272L464 272zM352 272L352 480L288 480L288 272L352 272zM240 272L240 480L176 480L176 272L240 272zM320 160C337.7 160 352 174.3 352 192C352 209.7 337.7 224 320 224C302.3 224 288 209.7 288 192C288 174.3 302.3 160 320 160z" />
          </svg>
          <p>uEnroll</p>
        </div>
      )}

      <div className="flex min-w-0 flex-1 justify-center">
        <div
          aria-hidden={!isGenerationMode}
          className={`flex shrink-0 items-center gap-3 transition-all ${
            isGenerationMode ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <div className="flex h-11 items-center overflow-hidden rounded-md border bg-background shadow-sm">
            <Button
              disabled={!isGenerationMode || noSchedules}
              className="h-11 w-9 shrink-0 rounded-none border-0 border-r px-0"
              variant="ghost"
              onClick={handlePrevious}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex h-11 items-center">
              <Input
                onChange={handleInputChange}
                className="h-11 w-[140px] rounded-none border-0 text-center text-sm"
                disabled={!isGenerationMode || noSchedules}
                value={
                  noSchedules
                    ? t("scheduleGeneration.noResults")
                    : selectedSchedule !== null
                      ? selectedSchedule + 1
                      : ""
                }
              />

              {!noSchedules && (
                <span className="flex h-11 items-center border-l px-3 text-sm text-muted-foreground">
                  {t("scheduleGeneration.of")} {schedules.length}
                </span>
              )}
            </div>

            <Button
              disabled={!isGenerationMode || noSchedules}
              className="h-11 w-9 shrink-0 rounded-none border-0 border-l px-0"
              variant="ghost"
              onClick={handleNext}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            disabled={
              !isGenerationMode || loading || courseSearchResults.length <= 0
            }
            variant="default"
            className="h-11 shrink-0 rounded-md px-5 text-base font-semibold"
            onClick={handleGeneration}
          >
            {loading ? t("common.loading") : t("calendar.generate")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LanguageSwitcherButton className="h-12 w-full" />
        <ThemeSwitchingButton className="h-12 w-full" />
        <AboutButton className="h-12 w-full px-4" />
      </div>
    </div>
  );
}
