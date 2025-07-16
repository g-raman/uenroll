import CourseResult from "./CourseResult/CourseResult";
import { Button } from "@repo/ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useTermParam } from "@/hooks/useTermParam";
import { useDataParam } from "@/hooks/useDataParam";

export default function SearchResults() {
  const [data] = useDataParam();
  const [selectedTerm] = useTermParam();

  const [openResults, setOpenResults] = useState<string[]>([]);

  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    !!selectedTerm && courseCodes.length > 0,
  );

  if (courseQueries.some(query => query.isLoading)) {
    return <div>Loading...</div>;
  }

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .sort((a, b) => b.dataUpdatedAt - a.dataUpdatedAt)
    .map(query => query.data);

  return (
    <div>
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
