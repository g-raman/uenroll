import { Course, Section } from "@/types/Types";
import { useState } from "react";
import { ComponentResult } from "../ComponentResult/ComponentResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface SectionResultProps {
  section: Section;
  course: Course;
}
export const SectionResult: React.FC<SectionResultProps> = ({
  section,
  course,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { courseCode, courseTitle, colour } = course;

  const handleSectionToggle = () => {
    setIsOpen((previous) => !previous);
  };

  return (
    <div className="md:text-sm">
      <div
        onClick={handleSectionToggle}
        className="flex hover:cursor-pointer justify-between z-20 items-center w-full p-2 bg-slate-200"
      >
        <span>Section {section.section}</span>
        <FontAwesomeIcon
          className={`transition-all ease-in delay-100 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
          icon={faChevronUp}
        />
      </div>

      {section.components.map((component) => {
        return (
          <div
            className={`transition-all ease-in delay-100 md:text-xs ${
              isOpen ? "opacity-100" : "max-h-0 opacity-0"
            }`}
            key={`${courseCode}${section.section}${component.subSection}`}
          >
            <ComponentResult
              component={component}
              course={course}
              section={section.section}
              subSection={component.subSection}
            />
          </div>
        );
      })}
    </div>
  );
};
