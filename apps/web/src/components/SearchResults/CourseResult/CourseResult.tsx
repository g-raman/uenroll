import { Course } from "@/types/Types";
import { SectionResult } from "../SectionResult/SectionResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useScheduleActions } from "@/stores/scheduleStore";

interface CourseResultProps {
  course: Course;
  openResults: string[];
}

const CourseResult: React.FC<CourseResultProps> = ({ course, openResults }) => {
  const { removeCourse } = useScheduleActions();

  const handleCourseRemoval = () => {
    removeCourse(course);
  };

  return (
    <>
      <AccordionTrigger
        className={`cursor-pointer items-center truncate p-2 font-normal ${course.colour} ${openResults.includes(course.courseCode) ? "rounded-b-none" : "rounded-b-sm"}`}
      >
        <p className="truncate">{`${course.courseCode}: ${course.courseTitle}`}</p>

        <Tooltip>
          <TooltipTrigger asChild>
            <FontAwesomeIcon
              className="ml-auto !rotate-0"
              onClick={handleCourseRemoval}
              icon={faTrash}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove this course</p>
          </TooltipContent>
        </Tooltip>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        <Accordion type="multiple" className="overflow-hidden rounded-b-sm">
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
