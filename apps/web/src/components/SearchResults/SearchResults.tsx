import { useSearchResults } from "@/contexts/SearchResultsContext";
import CourseResult from "./CourseResult/CourseResult";
import { Button } from "@repo/ui/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

export default function SearchResults() {
  const { state } = useSearchResults();

  return (
    <>
      {state.courses.map(course => {
        return (
          <div className="pb-4 text-sm" key={course.courseCode}>
            <Button variant="link" className="h-min px-2 py-1">
              <a
                href={`https://uo.zone/course/${course.courseCode.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
              >
                Best Professors for {course.courseCode}&nbsp;
                <FontAwesomeIcon size="sm" icon={faArrowUpRightFromSquare} />
              </a>
            </Button>

            <Accordion type="multiple">
              <AccordionItem value={course.courseCode}>
                <CourseResult course={course} />
              </AccordionItem>
            </Accordion>
          </div>
        );
      })}
    </>
  );
}
