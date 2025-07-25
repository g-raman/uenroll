import { ColouredCourse } from "@/types/Types";
import { SessionResult } from "../SessionResult/SessionResult";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Section } from "@repo/db/types";
import { useDataParam } from "@/hooks/useDataParam";
import { useCallback } from "react";

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
  const { courseCode } = course;
  const isSelected = Boolean(data[courseCode]?.includes(subSection));

  const addSession = useCallback(() => {
    if (
      data &&
      data[courseCode] &&
      data[courseCode].some(section => section === subSection)
    ) {
      return;
    }

    const newSelected = data ? { ...data } : {};

    if (!newSelected[courseCode] || newSelected[courseCode].length === 0) {
      newSelected[courseCode] = [subSection];
    } else {
      newSelected[courseCode].push(subSection);
    }

    setData(newSelected);
  }, [courseCode, data, setData, subSection]);

  const removeSession = useCallback(() => {
    const { courseCode } = course;

    if (data === null) return;

    if (!data[courseCode]) return;

    const filteredSubsections = data[courseCode].filter(
      section => section !== subSection,
    );

    const newData = { ...data };
    newData[courseCode] = filteredSubsections;

    setData(Object.keys(newData).length === 0 ? null : newData);
  }, [course, data, setData, subSection]);

  const handleToggle = useCallback(() => {
    if (isSelected) {
      removeSession();
      return;
    }
    addSession();
  }, [addSession, isSelected, removeSession]);

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
