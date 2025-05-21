import { useSearchResults } from "@/contexts/SearchResultsContext";
import CourseResult from "./CourseResult/CourseResult";

export default function SearchResults() {
  const { state } = useSearchResults();

  return (
    <>
      {state.courses.map(course => {
        return <CourseResult key={`${course.courseCode}`} course={course} />;
      })}
    </>
  );
}
