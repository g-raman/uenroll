import React from "react";

import CourseResult from "./CourseResult/CourseResult";
import { Accordion, AccordionItem } from "@repo/ui/components/accordion";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useCourseQueries } from "@/hooks/useCourseQueries";
import { useTermParam } from "@/hooks/useTermParam";
import { useDataParam } from "@/hooks/useDataParam";
import { useMode } from "@/stores/modeStore";

export default function SearchResults() {
  const [data] = useDataParam();
  const [selectedTerm] = useTermParam();
  const isGenerationMode = useMode();

  const [openResults, setOpenResults] = useState<string[]>([]);

  const courseCodes = Object.keys(data ? data : {});

  const courseQueries = useCourseQueries(
    selectedTerm,
    courseCodes,
    !!selectedTerm && courseCodes.length > 0,
  );

  if (courseQueries.some(query => query.isLoading)) {
    return <div>Loading...</div>;
  }

  const courseSearchResults = courseQueries
    .filter(query => query.isSuccess)
    .sort((a, b) => b.dataUpdatedAt - a.dataUpdatedAt)
    .map(query => query.data);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <Accordion multiple onValueChange={value => setOpenResults(value)}>
        {courseSearchResults.map(course => {
          return (
            <div className="pb-4 text-sm" key={course.courseCode}>
              <div className="px-2 pb-1">
                <a
                  href={`https://uo.grades.zone/course/${course.courseCode.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                  aria-label={`Open ${course.courseCode} on uo.grades.zone`}
                >
                  <span>Grades on uo.grades.zone</span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </div>
              <AccordionItem value={course.courseCode}>
                <CourseResult course={course} openResults={openResults} />
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>

      {isGenerationMode && courseQueries.length > 0 && (
        <p className="mt-2 mb-4 px-2 text-sm font-semibold">
          Customize by unchecking sections
        </p>
      )}
    </div>
  );
}
