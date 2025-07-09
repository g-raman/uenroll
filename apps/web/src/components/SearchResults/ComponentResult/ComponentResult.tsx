import { ColouredCourse } from "@/types/Types";
import { SessionResult } from "../SessionResult/SessionResult";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Section } from "@repo/db/types";
import { useSelectedSessionsURL } from "@/hooks/useSelectedSessionsURL";

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
  const [selected, setSelected] = useSelectedSessionsURL();
  const { courseCode } = course;
  const isSelected = Boolean(selected[courseCode]?.includes(subSection));

  function addSession() {
    const { courseCode } = course;
    if (
      selected &&
      selected[courseCode] &&
      selected[courseCode].some(section => section === subSection)
    ) {
      return;
    }

    const newSelected = selected === null ? {} : { ...selected };

    if (!newSelected[courseCode]) {
      newSelected[courseCode] = [subSection];
    } else {
      newSelected[courseCode].push(subSection);
    }

    setSelected(newSelected);
  }

  function removeSession() {
    const { courseCode } = course;

    if (selected === null) return;

    if (!selected[courseCode]) return;

    const filteredSubsections = selected[courseCode].filter(
      section => section !== subSection,
    );

    selected[courseCode] = filteredSubsections;

    if (Object.keys(selected).length === 0) {
      setSelected(null);
      return;
    }

    setSelected(selected);
  }

  function handleToggle() {
    if (isSelected) {
      removeSession();
      return;
    }
    addSession();
  }

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
