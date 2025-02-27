import {
  Course,
  Selected,
  SelectedCourse,
  SelectedSession,
  Term,
} from "@/types/Types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface SearchResultsContextType {
  courses: Course[];
  selected: Selected[];
  selectedSessions: SelectedSession[];
  term: Term | null;
  resetCourses: () => void;
  changeTerm: (term: Term) => void;
  addSelected: (selected: Selected) => void;
  addCourse: (course: Course) => void;
  addSelectedSession: (course: SelectedCourse) => void;
  removeSelectedSession: (
    courseCode: string,
    term: string,
    subSection: string,
  ) => void;
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
  const [selected, setSelected] = useState<Selected[]>([]);

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
    setSelected((currSelected) => {
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

  const addSelectedSession = useCallback((course: SelectedCourse) => {
    setSelectedSessions((currSelectedSessions) => {
      if (
        currSelectedSessions.some(
          (elem) =>
            elem.courseDetails.courseCode === course.courseCode &&
            elem.courseDetails.term === course.term &&
            elem.courseDetails.subSection == course.subSection,
        )
      ) {
        return currSelectedSessions;
      }
      const sessions = course.sessions.map((session) => {
        return {
          startTime: session.startTime.slice(0, -3),
          endTime: session.endTime.slice(0, -3),
          startRecur: session.startDate,
          endRecur: session.endDate,
          dayOfWeek: dayOfWeekToNumberMap[session.dayOfWeek] as number,
          courseDetails: {
            backgroundColour: course.colour,
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
            term: course.term,
            subSection: course.subSection,
            instructor: session.instructor,
            type: course.type,
            isOpen: course.isOpen,
          },
        };
      }) as SelectedSession[];
      return [...sessions, ...currSelectedSessions];
    });
  }, []);

  const removeSelectedSession = useCallback(
    (courseCode: string, term: string, subSection: string) => {
      setSelectedSessions((currSelectedSessions) => {
        const filtered = currSelectedSessions.filter(
          (course) =>
            !(
              course.courseDetails.courseCode === courseCode &&
              course.courseDetails.term === term &&
              course.courseDetails.subSection === subSection
            ),
        );
        return filtered;
      });
    },
    [],
  );

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
        addCourse,
        resetCourses,
        selectedSessions,
        addSelectedSession,
        removeSelectedSession,
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
