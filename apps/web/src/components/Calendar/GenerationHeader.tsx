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
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@repo/ui/components/button";

export function GenerationHeader() {
  const [selectedTerm] = useTermParam();
  const [data] = useDataParam();
  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length > 0,
  );

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
    <div className="flex w-full items-center rounded-md border px-4 py-3">
      <Button variant="default" onClick={handleGeneration}>
        Generate
      </Button>

      <div className="ms-auto flex items-center gap-1">
        <p className="me-4 text-base">
          {selectedSchedule !== null
            ? `${selectedSchedule + 1} out of ${schedules.length}`
            : null}
        </p>

        <Button variant="outline" onClick={previousSchedule}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </Button>

        <Button variant="outline" onClick={nextSchedule}>
          <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>
    </div>
  );
}
