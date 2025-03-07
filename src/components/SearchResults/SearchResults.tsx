import { useSearchResults } from "@/contexts/SearchResultsContext";
import React, { useState } from "react";
import Image from "next/image";
import CourseResult from "./CourseResult/CourseResult";

export default function SearchResults() {
  const { state } = useSearchResults();

  return (
    <>
      {state.courses.map((course) => {
        return (
          <CourseResult
            key={`${course.courseCode}${course.term}`}
            course={course}
          />
        );
      })}
    </>
  );
}
