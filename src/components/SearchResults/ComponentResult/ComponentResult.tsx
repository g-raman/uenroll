import { Component } from "@/types/Types";
import React, { useEffect, useMemo, useState } from "react";
import { SessionResult } from "../SessionResult/SessionResult";
import { useSearchResults } from "@/contexts/SearchResultsContext";

interface ComponentResultProps {
  component: Component;
  courseCode: string;
  courseTitle: string;
  term: string;
  section: string;
  subSection: string;
  colour: string;
}
export const ComponentResult: React.FC<ComponentResultProps> = ({
  component,
  courseCode,
  courseTitle,
  term,
  section,
  subSection,
  colour,
}) => {
  const { addSelected, removeSelectedSession } = useSearchResults();
  const [isSelected, setIsSelected] = useState(false);

  function handleToggle() {
    setIsSelected((is) => !is);
  }

  useEffect(() => {
    if (isSelected) {
      addSelected({ courseCode, subSection });
    } else {
      removeSelectedSession(courseCode, term, subSection);
    }
  }, [
    isSelected,
    component,
    courseCode,
    courseTitle,
    subSection,
    term,
    removeSelectedSession,
    colour,
    addSelected,
  ]);

  return (
    <div className="flex items-center justify-between h-full w-full border-b">
      <div className="px-2 h-full flex items-stretch">
        <input onChange={handleToggle} checked={isSelected} type="checkbox" />
      </div>

      <div
        className={`w-full ml-4 overflow-hidden flex flex-col gap-2 max-h-20 overflow-y-scroll ${component.sessions.length === 1 ? "no-scrollbar" : ""}`}
      >
        {component.sessions.map((session) => (
          <SessionResult
            key={`${courseCode}${term}${section}${subSection}${session.startDate}${session.dayOfWeek}${session.startTime}`}
            session={session}
          />
        ))}
      </div>

      <div className="flex w-1/3 h-full flex-col items-center uppercase border-l-slate-400 border-l p-6">
        <span
          className={`font-bold text-base ${component.isOpen ? "text-lime-600" : "text-red-800"}`}
        >
          {component.subSection}
        </span>
        <span>{component.type}</span>
      </div>
    </div>
  );
};
