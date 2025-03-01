import { Section } from "@/types/Types";
import React, { useState } from "react";
import Image from "next/image";
import { ComponentResult } from "../ComponentResult/ComponentResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface SectionResultProps {
  section: Section;
  courseCode: string;
  courseTitle: string;
  term: string;
  colour: string;
}
export const SectionResult: React.FC<SectionResultProps> = ({
  section,
  courseCode,
  courseTitle,
  term,
  colour,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:text-sm">
      <div
        onClick={() => setIsOpen((is) => !is)}
        className="flex hover:cursor-pointer justify-between z-20 items-center w-full p-2 bg-slate-200"
      >
        <span>Section {section.section}</span>
        <FontAwesomeIcon
          className={`transition-all ease-in delay-100 ${isOpen ? "rotate-0" : "rotate-180"}`}
          icon={faChevronUp}
        />
      </div>

      {section.components.map((component) => {
        return (
          <div
            className={`transition-all ease-in delay-100 md:text-xs ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
            key={`${courseCode}${term}${section.section}${component.subSection}`}
          >
            <ComponentResult
              component={component}
              courseCode={courseCode}
              courseTitle={courseTitle}
              term={term}
              section={section.section}
              subSection={component.subSection}
              isSelectedInitial={component.isSelected}
              colour={colour}
            />
          </div>
        );
      })}
    </div>
  );
};
