import { ColouredCourse } from "@/types/Types";
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
import { useColoursActions } from "@/stores/colourStore";
import { useDataParam } from "@/hooks/useDataParam";
import { useCallback } from "react";

interface CourseResultProps {
  course: ColouredCourse;
  openResults: string[];
}

const CourseResult: React.FC<CourseResultProps> = ({ course, openResults }) => {
  const { addColour } = useColoursActions();
  const [data, setData] = useDataParam();

  const removeCourse = useCallback(() => {
    if (data === null || !data[course.courseCode]) {
      return;
    }
    const newData = { ...data };
    delete newData[course.courseCode];

    setData(Object.keys(newData).length === 0 ? null : newData);
    addColour(course.courseCode, course.colour);
  }, [addColour, course.colour, course.courseCode, data, setData]);

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
              onClick={removeCourse}
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
          {Object.entries(course.sections).map(section => {
            const [sectionKey, sectionInfo] = section;
            return (
              <AccordionItem
                value={`${course.courseCode}${sectionKey}`}
                key={`${course.courseCode}${sectionKey}`}
              >
                <SectionResult
                  section={sectionKey}
                  sectionInfo={sectionInfo}
                  course={course}
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      </AccordionContent>
    </>
  );
};

export default CourseResult;
