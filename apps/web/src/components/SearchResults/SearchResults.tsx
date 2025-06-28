import CourseResult from "./CourseResult/CourseResult";
import { Button } from "@repo/ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCourseSearchResults } from "@/stores/scheduleStore";

export default function SearchResults() {
  const [openResults, setOpenResults] = useState<string[]>([]);
  const courseSearchResults = useCourseSearchResults();

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
