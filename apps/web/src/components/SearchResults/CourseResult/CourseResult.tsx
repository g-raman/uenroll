import { Course } from "@/types/Types";
import { SectionResult } from "../SectionResult/SectionResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSearchResults } from "@/contexts/SearchResultsContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

interface CourseResultProps {
  course: Course;
  openResults: string[];
}

const CourseResult: React.FC<CourseResultProps> = ({ course, openResults }) => {
  const { dispatch } = useSearchResults();

  const handleCourseRemoval = () => {
    dispatch({ type: "remove_course", payload: course });
  };

  return (
    <>
      <AccordionTrigger
        className={`cursor-pointer items-center truncate p-2 font-normal ${course.colour} ${openResults.includes(course.courseCode) ? "rounded-b-none" : "rounded-b-sm"}`}
      >
        <p className="truncate">{`${course.courseCode}: ${course.courseTitle}`}</p>

        <FontAwesomeIcon
          className="ml-auto !rotate-0"
          onClick={handleCourseRemoval}
          icon={faTrash}
        />
      </AccordionTrigger>

      <AccordionContent className="p-0">
        <Accordion
          type="multiple"
          className="overflow-hidden rounded-b-sm border-x border-slate-200"
        >
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
    </>
  );
};

export default CourseResult;
