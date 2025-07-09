import CourseResult from "./CourseResult/CourseResult";
import { Button } from "@repo/ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { useColoursActions } from "@/stores/colourStore";
import { useSelectedSessionsURL } from "@/hooks/useSelectedSessionsURL";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useTermParam } from "@/hooks/useTermParam";

export default function SearchResults() {
  const [selected, setSelected] = useSelectedSessionsURL();
  const [selectedTerm, setSelectedTerm] = useTermParam();

  const { data: availableTerms } = useQuery(trpc.getTerms.queryOptions());
  const [openResults, setOpenResults] = useState<string[]>([]);
  const { getColour } = useColoursActions();

  const courseCodes = Object.keys(selected ? selected : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    courseCodes.length >= 0,
  );

  if (!availableTerms || availableTerms.length === 0) {
    return <div>Loading...</div>;
  }
  const termInUrl = availableTerms.find(
    availableTerm => availableTerm.value === selectedTerm,
  );

  if (!termInUrl) {
    setSelectedTerm(availableTerms[0]?.value as string);
    setSelected({});
  }

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .map(query => ({
      ...query.data,
      colour: getColour(query.data.courseCode),
    }));

  if (courseQueries.some(query => query.isLoading)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-y-scroll">
      <Accordion type="multiple" onValueChange={value => setOpenResults(value)}>
        {courseSearchResults.map(course => {
          return (
            <div className="pb-4 text-sm" key={course.courseCode}>
              <Button
                asChild
                variant="link"
                className="h-min items-baseline gap-0 !px-2 py-1 dark:text-white"
              >
                <a
                  href={`https://uo.zone/course/${course.courseCode.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Best Professors for {course.courseCode}&nbsp;
                  <FontAwesomeIcon size="sm" icon={faArrowUpRightFromSquare} />
                </a>
              </Button>

              <AccordionItem value={course.courseCode}>
                <CourseResult course={course} openResults={openResults} />
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
    </div>
  );
}
