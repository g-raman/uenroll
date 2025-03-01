import {
  Component,
  Course,
  Selected,
  SelectedCourse,
  SelectedSession,
  Session,
  Term,
} from "@/types/Types";
import { useQueryState } from "nuqs";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

interface SearchResultsContextType {
  courses: Course[];
  selected: Selected[];
  selectedSessions: SelectedSession[];
  term: Term | null;
  resetCourses: () => void;
  changeTerm: (term: Term) => void;
  addSelected: (selected: Selected) => void;
  removeSelected: (selected: Selected) => void;
  addCourse: (course: Course) => void;
}

const SearchResultsContext = createContext<
  SearchResultsContextType | undefined
>(undefined);
const dayOfWeekToNumberMap: { [key: string]: number } = {
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
  Su: 0,
};

const availableColours = [
  "bg-red-300 text-black border-l-red-400",
  "bg-sky-300 text-black border-l-sky-500",
  "bg-lime-200 text-black border-l-lime-400",
  "bg-yellow-200 text-black border-l-yellow-400",
  "bg-amber-400 text-black border-l-amber-500",
  "bg-emerald-500 text-black border-l-emerald-600",
  "bg-indigo-400 text-black border-l-indigo-500",
  "bg-pink-400 text-black border-l-pink-500",
  "bg-violet-500 text-black border-l-violet-600",
  "bg-orange-500 text-white border-l-orange-500",
  "bg-blue-500 text-white border-l-blue-500",
];

const createSession = (
  session: Session,
  component: Component,
  course: Course,
) => ({
  startTime: session.startTime.slice(0, -3),
  endTime: session.endTime.slice(0, -3),
  startRecur: session.startDate,
  endRecur: session.endDate,
  dayOfWeek: dayOfWeekToNumberMap[session.dayOfWeek] as number,
  courseDetails: {
    backgroundColour: course.colour as string,
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    term: course.term,
    subSection: component.subSection,
    instructor: session.instructor,
    type: component.type,
    isOpen: component.isOpen,
  },
});

export const SearchResultsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>(
    [],
  );
  const [term, setTerm] = useState<Term | null>(null);
  const [chosenColours, setChosenColours] = useState<Set<string>>(
    new Set<string>(),
  );
  const [selected, setSelected] = useQueryState("data", {
    defaultValue: null,
    history: "push",
    parse: JSON.parse,
    serialize: JSON.stringify,
  });

  const selectRandomColour = useCallback(() => {
    const filteredColours = availableColours.filter(
      (colour) => !chosenColours.has(colour),
    );
    const randomIndex = Math.floor(Math.random() * filteredColours.length);
    const chosenColour = filteredColours[randomIndex];
    setChosenColours((prevSet) => new Set<string>(prevSet).add(chosenColour));
    return chosenColour;
  }, [chosenColours]);

  const addSelected = useCallback((selected: Selected) => {
    setSelected((currSelected: Selected[]) => {
      if (!currSelected) {
        return [];
      }

      if (
        currSelected.some(
          (elem) =>
            elem.courseCode === selected.courseCode &&
            elem.subSection === selected.subSection,
        )
      ) {
        return currSelected;
      }
      return [selected, ...currSelected];
    });
  }, []);

  const removeSelected = useCallback((selected: Selected) => {
    setSelected((currSelected: Selected[]) => {
      if (!currSelected) {
        return [];
      }
      return currSelected.filter(
        (subSection) =>
          subSection.courseCode !== selected.courseCode ||
          subSection.subSection !== selected.subSection,
      );
    });
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const isSelected = (component: Component, course: Course) =>
      selected.some(
        (elem: Selected) =>
          elem.subSection === component.subSection &&
          elem.courseCode === course.courseCode,
      );

    const results: SelectedSession[] = courses.flatMap((course) =>
      course.sections.flatMap((section) =>
        section.components.flatMap((component) =>
          component.sessions
            .filter((session) => isSelected(component, course))
            .map((session) => createSession(session, component, course)),
        ),
      ),
    );

    setSelectedSessions(results);
  }, [courses, selected]);

  const addCourse = useCallback(
    (course: Course) => {
      setCourses((currCourses) => {
        if (
          currCourses.some(
            (elem) =>
              elem.courseCode === course.courseCode &&
              elem.term === course.term,
          )
        ) {
          return currCourses;
        }
        const colour = selectRandomColour();
        course.colour = colour;
        course.sections.forEach((section) =>
          section.components.forEach((component) => {
            component.isSelected = selected.some((selectedCourse: Selected) => {
              return (
                selectedCourse.courseCode === course.courseCode &&
                selectedCourse.subSection === component.subSection
              );
            });
          }),
        );
        return [course, ...currCourses];
      });
    },
    [selectRandomColour],
  );

  const resetCourses = useCallback(() => {
    setCourses([]);
    setSelectedSessions([]);
    setChosenColours(new Set());
  }, []);

  const changeTerm = useCallback((term: Term) => {
    setTerm(term);
    setCourses([]);
    setSelectedSessions([]);
  }, []);

  return (
    <SearchResultsContext.Provider
      value={{
        courses,
        selected,
        addSelected,
        removeSelected,
        addCourse,
        resetCourses,
        selectedSessions,
        term,
        changeTerm,
      }}
    >
      {children}
    </SearchResultsContext.Provider>
  );
};

export const useSearchResults = (): SearchResultsContextType => {
  const context = useContext(SearchResultsContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
};
