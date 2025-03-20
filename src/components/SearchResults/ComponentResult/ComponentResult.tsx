import { Component, Course } from "@/types/Types";
import { useEffect, useState } from "react";
import { SessionResult } from "../SessionResult/SessionResult";
import { useSearchResults } from "@/contexts/SearchResultsContext";

interface ComponentResultProps {
  component: Component;
  course: Course;
  section: string;
  subSection: string;
}
export const ComponentResult: React.FC<ComponentResultProps> = ({
  component,
  course,
  section,
  subSection,
}) => {
  const { state, dispatch } = useSearchResults();
  const { courseCode } = course;
  const isSelectedInitially = Boolean(
    state.selected &&
      state.selected[courseCode] &&
      state.selected[courseCode].includes(subSection),
  );
  const [isSelected, setIsSelected] = useState(isSelectedInitially);

  useEffect(() => {
    const actionType = isSelected ? "add_selected" : "remove_selected";
    dispatch({ type: actionType, payload: { courseCode, subSection } });
  }, [isSelected, dispatch, courseCode, subSection]);

  function handleToggle() {
    setIsSelected(previous => !previous);
  }

  return (
    <div className="flex h-full w-full items-center justify-between border-b">
      <div className="flex h-full items-stretch px-2">
        <input onChange={handleToggle} checked={isSelected} type="checkbox" />
      </div>

      <div
        className={`ml-4 flex max-h-20 w-full flex-col gap-2 overflow-y-scroll ${
          component.sessions.length === 1 ? "no-scrollbar" : ""
        }`}
      >
        {component.sessions.map(session => (
          <SessionResult
            key={`${courseCode}${section}${subSection}${session.startDate}${session.dayOfWeek}${session.startTime}`}
            session={session}
          />
        ))}
      </div>

      <div className="flex h-full w-1/3 flex-col items-center border-l border-l-slate-400 p-6 uppercase">
        <span
          className={`text-base font-bold ${component.isOpen ? "text-lime-600" : "text-red-800"}`}
        >
          {component.subSection}
        </span>
        <span>{component.type}</span>
      </div>
    </div>
  );
};
