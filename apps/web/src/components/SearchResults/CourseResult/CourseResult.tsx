import { Course } from "@/types/Types";
import { SectionResult } from "../SectionResult/SectionResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Button } from "@repo/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

interface CourseResultProps {
  course: Course;
}

const CourseResult: React.FC<CourseResultProps> = ({ course }) => {
  const { dispatch } = useSearchResults();

  const handleCourseRemoval = () => {
    dispatch({ type: "remove_course", payload: course });
  };

  return (
    <div className="pb-4 text-sm">
      <Button variant="link" className="h-min px-2 py-1">
        <a
          href={`https://uo.zone/course/${course.courseCode.toLowerCase()}`}
          target="_blank"
          rel="noreferrer"
        >
          Best Professors for {course.courseCode}&nbsp;
          <FontAwesomeIcon size={"sm"} icon={faArrowUpRightFromSquare} />
        </a>
      </Button>

      <Accordion type="single" collapsible>
        <AccordionItem value="course-1">
          <AccordionTrigger
            className={`${course.colour} items-center p-2 font-normal`}
          >
            <p className="truncate">{`${course.courseCode}: ${course.courseTitle}`}</p>

            <FontAwesomeIcon
              className="ml-auto !rotate-0"
              onClick={handleCourseRemoval}
              icon={faTrash}
            />
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <Accordion type="multiple">
              {course.sections.map(section => {
                return (
                  <AccordionItem
                    value={`${course.courseCode}${section.section}`}
                    key={`${course.courseCode}${section.section}`}
                  >
                    <SectionResult section={section} course={course} />
                  </AccordionItem>
                );
              })}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CourseResult;
