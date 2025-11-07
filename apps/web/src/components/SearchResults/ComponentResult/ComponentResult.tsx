import { ColouredCourse } from "@/types/Types";
import { SessionResult } from "../SessionResult/SessionResult";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Section } from "@repo/db/types";
import { useDataParam } from "@/hooks/useDataParam";
import { useCallback } from "react";
import { useMode } from "@/stores/modeStore";
import { useExcluded, useGeneratorActions } from "@/stores/generatorStore";

interface ComponentResultProps {
  component: Section;
  course: ColouredCourse;
  section: string;
  subSection: string;
}
export const ComponentResult: React.FC<ComponentResultProps> = ({
  component,
  course,
  section,
  subSection,
}) => {
  const [data, setData] = useDataParam();
  const isGenerationMode = useMode();
  const excluded = useExcluded();
  const { setExcluded } = useGeneratorActions();

  const { courseCode } = course;
  const isSelected =
    (isGenerationMode && excluded === null) ||
    (isGenerationMode &&
      excluded &&
      !excluded[courseCode]?.includes(subSection)) ||
    (!isGenerationMode && Boolean(data[courseCode]?.includes(subSection)));

  const addSession = useCallback(() => {
    const selected = isGenerationMode ? excluded : data;
    if (
      selected &&
      selected[courseCode] &&
      selected[courseCode].some(section => section === subSection)
    ) {
      return;
    }

    const newSelected = selected ? { ...selected } : {};

    if (!newSelected[courseCode] || newSelected[courseCode].length === 0) {
      newSelected[courseCode] = [subSection];
    } else {
      newSelected[courseCode].push(subSection);
    }

    if (isGenerationMode) {
      setExcluded(newSelected);
    } else {
      setData(newSelected);
    }
  }, [
    courseCode,
    data,
    excluded,
    isGenerationMode,
    setData,
    setExcluded,
    subSection,
  ]);

  const removeSession = useCallback(() => {
    const selected = isGenerationMode ? excluded : data;
    const { courseCode } = course;

    if (selected === null) return;

    if (!selected[courseCode]) return;

    const filteredSubsections = selected[courseCode].filter(
      section => section !== subSection,
    );

    const newSelected = { ...selected };
    newSelected[courseCode] = filteredSubsections;

    if (isGenerationMode) {
      setExcluded(Object.keys(newSelected).length === 0 ? null : newSelected);
    } else {
      setData(Object.keys(newSelected).length === 0 ? null : newSelected);
    }
  }, [
    course,
    data,
    excluded,
    isGenerationMode,
    setData,
    setExcluded,
    subSection,
  ]);

  const handleToggle = useCallback(() => {
    if (isGenerationMode && isSelected) addSession();
    else if (isGenerationMode && !isSelected) removeSession();
    else if (!isGenerationMode && isSelected) removeSession();
    else addSession();
  }, [addSession, isGenerationMode, isSelected, removeSession]);

  return (
    <div className="flex h-full w-full items-center justify-between border-x border-b md:text-xs">
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
