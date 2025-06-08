import { Component, Course } from "@/types/Types";
import { SessionResult } from "../SessionResult/SessionResult";
import { useSearchResults } from "@/contexts/SearchResultsContext";
import { Checkbox } from "@repo/ui/components/checkbox";

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
  const isSelected = Boolean(
    state.selected &&
      state.selected[courseCode] &&
      state.selected[courseCode].includes(subSection),
  );

  function handleToggle() {
    const actionType = isSelected ? "remove_selected" : "add_selected";
    dispatch({ type: actionType, payload: { courseCode, subSection } });
  }

  return (
    <div className="flex h-full w-full items-center justify-between border-b md:text-xs">
      <div className="px-4">
        <Checkbox onCheckedChange={handleToggle} checked={isSelected} />
      </div>

      <div className="flex h-full w-full flex-col gap-2 overflow-y-scroll border-r border-r-slate-400 py-2">
        {component.sessions.map(session => (
          <SessionResult
            key={`${courseCode}${section}${subSection}${session.startDate}${session.dayOfWeek}${session.startTime}`}
            session={session}
          />
        ))}
      </div>

      <div className="flex w-1/3 flex-col items-center px-4 uppercase">
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
