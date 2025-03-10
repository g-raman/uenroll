import { Course } from "@/types/Types";
import { useState } from "react";
import { SectionResult } from "../SectionResult/SectionResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSearchResults } from "@/contexts/SearchResultsContext";

interface CourseResultProps {
  course: Course;
}

const CourseResult: React.FC<CourseResultProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useSearchResults();

  const handleCourseToggle = () => {
    setIsOpen((previous) => !previous);
  };

  const handleCourseRemoval = () => {
    dispatch({ type: "remove_course", payload: course });
  };

  return (
    <div className="pb-4 text-sm">
      <div className="border rounded-md overflow-hidden">
        <div
          onClick={handleCourseToggle}
          className={`hover:cursor-pointer p-2 ${course.colour}`}
        >
          <div className="flex items-center justify-between">
            <div className="truncate">
              <span>{`${course.courseCode}: ${course.courseTitle}`}</span>
            </div>

            <div className="flex gap-6 md:gap-4 ml-4 items-baseline">
              <FontAwesomeIcon onClick={handleCourseRemoval} icon={faTrash} />
              <FontAwesomeIcon
                className={`transition-all ease-in delay-100 ${
                  isOpen ? "rotate-0" : "rotate-180"
                }`}
                icon={faChevronUp}
              />
            </div>
          </div>
        </div>

        {course.sections.map((section) => {
          return (
            <div
              className={`overflow-hidden transition-all ease-in delay-100 ${
                isOpen ? "opacity-100" : "max-h-0 opacity-0"
              }`}
              key={`${course.courseCode}${section.section}`}
            >
              <SectionResult section={section} course={course} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseResult;
