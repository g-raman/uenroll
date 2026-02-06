import { ColouredCourse } from "@/types/Types";
import { SectionResult } from "../SectionResult/SectionResult";
import { Trash } from "lucide-react";
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
import { useExcluded, useGeneratorActions } from "@/stores/generatorStore";
import { useMode } from "@/stores/modeStore";

interface CourseResultProps {
  course: ColouredCourse;
  openResults: string[];
}

const CourseResult: React.FC<CourseResultProps> = ({ course, openResults }) => {
  const { addColour } = useColoursActions();
  const [data, setData] = useDataParam();
  const isGenerationMode = useMode();
  const excluded = useExcluded();
  const { resetSchedulesKeepExcluded } = useGeneratorActions();

  const removeCourse = useCallback(() => {
    if (data === null || !data[course.courseCode]) return;
    const newData = { ...data };
    delete newData[course.courseCode];

    setData(Object.keys(newData).length === 0 ? null : newData);
    addColour(course.courseCode, course.colour);

    if (!isGenerationMode) return;
    const newExcluded = excluded === null ? null : { ...excluded };

    if (newExcluded !== null) delete newExcluded[course.courseCode];

    resetSchedulesKeepExcluded(
      newExcluded === null || Object.keys(newExcluded).length === 0
        ? null
        : newExcluded,
    );
  }, [
    addColour,
    course.colour,
    course.courseCode,
    data,
    excluded,
    isGenerationMode,
    resetSchedulesKeepExcluded,
    setData,
  ]);

  return (
    <>
      <AccordionTrigger
        className={`cursor-pointer items-center justify-between truncate !border-none p-2 font-normal ${course.colour} ${openResults.includes(course.courseCode) ? "rounded-b-none" : "rounded-b-sm"}`}
      >
        <p className="mr-2 truncate">{`${course.courseCode}: ${course.courseTitle}`}</p>

        <Tooltip>
          <TooltipTrigger
            className="ml-auto"
            render={
              <Trash
                fill="#000"
                strokeWidth={2}
                className="size-4 shrink-0 !rotate-0"
                onClick={removeCourse}
              />
            }
          />

          <TooltipContent>
            <p>Remove this course</p>
          </TooltipContent>
        </Tooltip>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        <Accordion multiple className="overflow-hidden rounded-b-sm">
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
