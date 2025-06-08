import { Course, Section } from "@/types/Types";
import { useState } from "react";
import { ComponentResult } from "../ComponentResult/ComponentResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
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
    <Accordion type="single" collapsible className="md:text-sm">
      <AccordionItem value="item-1">
        <AccordionTrigger className="cursor-pointer rounded-none bg-slate-200 p-2 font-normal">
          <span>Section {section.section}</span>
        </AccordionTrigger>

        {section.components.map(component => {
          return (
            <AccordionContent
              className="p-0"
              key={`${courseCode}${section.section}${component.subSection}`}
            >
              <ComponentResult
                component={component}
                course={course}
                section={section.section}
                subSection={component.subSection}
              />
            </AccordionContent>
          );
        })}
      </AccordionItem>
    </Accordion>
  );
};
