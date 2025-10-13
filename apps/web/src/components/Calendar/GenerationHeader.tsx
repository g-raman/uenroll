import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useDataParam } from "@/hooks/useDataParam";
import { useTermParam } from "@/hooks/useTermParam";
import {
  useGeneratorActions,
  useSchedules,
  useSelectedSchedule,
} from "@/stores/generatorStore";
import { generateSchedule } from "@/utils/generator";
import { courseToCourseWithSectionAlternatives } from "@/utils/mappers/course";
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

export function GenerationHeader() {
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

  const isGenerationMode = useMode();
  const { toggleMode } = useModeActions();

  const schedules = useSchedules();
  const selectedSchedule = useSelectedSchedule();

  const { previousSchedule, nextSchedule, setSchedules } =
    useGeneratorActions();

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => query.data);

  const handleGeneration = () => {
    const coursesWithAlternatives = courseSearchResults.map(result =>
      courseToCourseWithSectionAlternatives(result),
    );
    const schedules = generateSchedule(coursesWithAlternatives);

    setSchedules(schedules);
  };

  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-baseline justify-start text-4xl">
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
              className="w-6 rounded-e-none border-e-[0px]"
              variant="outline"
              onClick={previousSchedule}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>

            <Input
              className="!max-w-28 rounded-none text-center"
              disabled={selectedSchedule === null}
              value={
                selectedSchedule === null
                  ? `No results`
                  : `${selectedSchedule + 1} of ${schedules.length}`
              }
            />

            <Button
              className="w-6 rounded-s-none border-s-[0px]"
              variant="outline"
              onClick={nextSchedule}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>

          <Button variant="default" onClick={handleGeneration}>
            Generate
          </Button>
        </div>
      )}

      <div className="ms-4 flex items-center space-x-2">
        <Switch
          id="generation-mode"
          checked={isGenerationMode}
          onCheckedChange={toggleMode}
        />
        <Label htmlFor="airplane-mode">Generation Mode</Label>
      </div>
    </div>
  );
}
