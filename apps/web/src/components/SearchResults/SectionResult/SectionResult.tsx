import { Course, Section } from "@/types/Types";
import { ComponentResult } from "../ComponentResult/ComponentResult";
import {
  AccordionContent,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

interface SectionResultProps {
  section: Section;
  course: Course;
}
export const SectionResult: React.FC<SectionResultProps> = ({
  section,
  course,
}) => {
  const { courseCode } = course;

  return (
    <>
      <AccordionTrigger className="cursor-pointer rounded-none bg-slate-200 p-2 font-normal dark:text-black">
        <span>Section {section.section}</span>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        {section.components.map(component => {
          return (
            <ComponentResult
              key={`${courseCode}${section.section}${component.subSection}`}
              component={component}
              course={course}
              section={section.section}
              subSection={component.subSection}
            />
          );
        })}
      </AccordionContent>
    </>
  );
};
