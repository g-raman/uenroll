import { Course } from "@/types/Types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionResult } from "../SectionResult/SectionResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSearchResults } from "@/contexts/SearchResultsContext";

interface CourseResultProps {
  course: Course;
}

const CourseResult: React.FC<CourseResultProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { removeCourse, selectRandomColour, addAvailableColour } =
    useSearchResults();

  useEffect(() => {
    const colour = selectRandomColour();
    course.colour = colour;

    return () => addAvailableColour(course.colour as string);
  }, []);

  return (
    <div className="pb-4 text-sm">
      <div className="border rounded-md overflow-hidden">
        <div
          onClick={() => setIsOpen((is) => !is)}
          className={`hover:cursor-pointer p-2 ${course.colour}`}
        >
          <div className="flex items-center justify-between">
            <div className="truncate">
              <span>{`${course.courseCode}: ${course.courseTitle}`}</span>
            </div>

            <div className="flex gap-6 md:gap-4 ml-4 items-baseline">
              <FontAwesomeIcon
                onClick={() => removeCourse(course)}
                icon={faTrash}
              />
              <FontAwesomeIcon
                className={`transition-all ease-in delay-100 ${isOpen ? "rotate-0" : "rotate-180"}`}
                icon={faChevronUp}
              />
            </div>
          </div>
        </div>
        {course.sections.map((section) => {
          return (
            <div
              className={`overflow-hidden transition-all ease-in delay-100 ${isOpen ? "opacity-100" : "max-h-0 opacity-0"}`}
              key={`${course.courseCode}${course.term}${section.section}`}
            >
              <SectionResult
                courseCode={course.courseCode}
                term={course.term}
                courseTitle={course.courseTitle}
                colour={course.colour as string}
                section={section}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseResult;
