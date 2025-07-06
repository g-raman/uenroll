import { ColouredCourse } from "@/types/Types";
import { SessionResult } from "../SessionResult/SessionResult";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  useScheduleActions,
  useSelectedSessionsURL,
} from "@/stores/scheduleStore";
import { Section } from "@repo/db/types";

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
  const selectedSessionsURL = useSelectedSessionsURL();
  const { addSession, removeSession } = useScheduleActions();
  const { courseCode } = course;
  const isSelected = Boolean(
    selectedSessionsURL &&
      selectedSessionsURL[courseCode] &&
      selectedSessionsURL[courseCode].includes(subSection),
  );

  function handleToggle() {
    if (isSelected) {
      removeSession({ courseCode, subSection });
      return;
    }
    addSession({ courseCode, subSection });
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
