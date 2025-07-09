import { ColouredCourse, Selected } from "@/types/Types";
import { dayOfWeekToNumberMap } from "./constants";
import { Session, Section } from "@repo/db/types";
import dayjs from "dayjs";
import { datetime, RRule } from "rrule";

const DATE_FORMAT = "YYYY-MM-DD";
const createCalendarEvent = (
  session: Session,
  component: Section,
  course: ColouredCourse,
) => {
  const baseStartDate = dayjs(session.startDate);
  const dayOfWeek = dayOfWeekToNumberMap[session.dayOfWeek] as number;
  const dayOffset = dayOfWeek - baseStartDate.day();

  const startDate = baseStartDate.add(
    dayOffset < 0 ? 7 + dayOffset : dayOffset,
    "days",
  );
  const endDate = dayjs(session.endDate);

  const rrule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: datetime(
      startDate.get("year"),
      startDate.get("month") + 1,
      startDate.get("day"),
    ),
    until: datetime(
      endDate.get("year"),
      endDate.get("month") + 1,
      endDate.get("day"),
    ),
  });
  const startTime = session.startTime.slice(0, -3);
  const endTime = session.endTime.slice(0, -3);

  return {
    id: `${course.courseCode}${component.subSection}`,
    title: `${course.courseCode}`,
    start: `${startDate.format(DATE_FORMAT)} ${startTime}`,
    end: `${startDate.format(DATE_FORMAT)} ${endTime}`,
    rrule: rrule.toString(),
    backgroundColour: course.colour,
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    term: course.term,
    subSection: component.subSection,
    instructor: session.instructor,
    type: component.type,
    isOpen: component.isOpen,
  };
};

const isSelected = (
  subSection: Section,
  course: ColouredCourse,
  selected: Selected,
) => {
  if (!selected) return false;
  if (!selected[course.courseCode]) return false;

  return selected[course.courseCode]?.some(
    (section: string) => subSection.subSection === section,
  );
};

export const createCalendarEvents = (
  courses: ColouredCourse[],
  selected: Selected | null,
) => {
  if (selected === null) return [];

  return courses.flatMap(course =>
    Object.values(course.sections).flatMap(section =>
      section
        .filter(subSection => isSelected(subSection, course, selected))
        .flatMap(subSection =>
          subSection.sessions
            .filter(session => session.dayOfWeek !== "N/A")
            .map(session => createCalendarEvent(session, subSection, course)),
        ),
    ),
  );
};
