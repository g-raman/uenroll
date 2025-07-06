import { ComponentResult } from "../ComponentResult/ComponentResult";
import {
  AccordionContent,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Section } from "@repo/db/types";
import { ColouredCourse } from "@/types/Types";

interface SectionResultProps {
  section: string;
  sectionInfo: Section[];
  course: ColouredCourse;
}
export const SectionResult: React.FC<SectionResultProps> = ({
  section,
  sectionInfo,
  course,
}) => {
  const { courseCode } = course;

  return (
    <>
      <AccordionTrigger className="cursor-pointer rounded-none bg-slate-200 p-2 font-normal dark:bg-neutral-200 dark:text-black">
        <span>Section {section}</span>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        {sectionInfo.map(subSection => {
          return (
            <ComponentResult
              key={`${courseCode}${section}${subSection.subSection}`}
              component={subSection}
              course={course}
              section={section}
              subSection={subSection.subSection as string}
            />
          );
        })}
      </AccordionContent>
    </>
  );
};
