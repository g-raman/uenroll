import { useSearchResults } from "@/contexts/SearchResultsContext";
import CourseResult from "./CourseResult/CourseResult";
import { Button } from "@repo/ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function SearchResults() {
  const { state } = useSearchResults();
  const [openResults, setOpenResults] = useState<string[]>([]);

  return (
    <div className="overflow-y-scroll">
      <Accordion type="multiple" onValueChange={value => setOpenResults(value)}>
        {state.courses.map(course => {
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
