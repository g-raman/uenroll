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
import LZString from "lz-string";

interface SearchResultsContextType {
  courses: Course[];
  selected: Selected[];
  selectedSessions: SelectedSession[];
  term: Term | null;
  resetCourses: () => void;
  changeTerm: (term: Term) => void;
  initializeTerm: (term: Term) => void;
  addSelected: (courseCode: string, subSection: string) => void;
  removeSelected: (courseCode: string, subSection: string) => void;
  resetSelected: () => void;
  addCourse: (course: Course) => void;
  removeCourse: (course: Course) => void;
  selectRandomColour: () => string;
  addAvailableColour: (colour: string) => void;
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
  Su: 7,
};

const INITIAL_COLOURS = [
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

const shuffledColours = shuffleArray(INITIAL_COLOURS);

function shuffleArray(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
  const [availableColours, setAvailableColours] =
    useState<string[]>(shuffledColours);
  const [selected, setSelected] = useQueryState("data", {
    defaultValue: null,
    history: "push",
    parse: (value) => JSON.parse(LZString.decompressFromBase64(value)),
    serialize: (value) => LZString.compressToBase64(JSON.stringify(value)),
  });

  const selectRandomColour = useCallback(() => {
    const colour = availableColours.at(-1) as string;
    setAvailableColours((prevAvailableColours) =>
      prevAvailableColours.slice(0, -1),
    );
    return colour;
  }, [availableColours]);

  const addAvailableColour = useCallback((colour: string) => {
    setAvailableColours((prevAvailableColours) => [
      ...prevAvailableColours,
      colour,
    ]);
  }, []);

  const addSelected = useCallback((courseCode: string, subSection: string) => {
    setSelected((currSelected: Selected) => {
      if (!currSelected) {
        const selected: Selected = {};
        selected[courseCode] = [subSection];
        return selected;
      }

      if (!currSelected[courseCode]) {
        const selected = { ...currSelected };
        selected[courseCode] = [subSection];
        return selected;
      }

      const alreadySelected = currSelected[courseCode].some(
        (section) => section === subSection,
      );
      if (alreadySelected) return currSelected;

      const selected = { ...currSelected };
      selected[courseCode].push(subSection);

      return selected;
    });
  }, []);

  const removeSelected = useCallback(
    (courseCode: string, subSection: string) => {
      setSelected((currSelected: Selected) => {
        if (!currSelected) return null;

        if (!currSelected[courseCode]) return currSelected;

        const selected = { ...currSelected };
        const filtered = currSelected[courseCode].filter(
          (section) => section !== subSection,
        );
        selected[courseCode] = filtered;
        if (filtered.length === 0) delete selected[courseCode];

        if (Object.keys(selected).length === 0) return null;

        return selected;
      });
    },
    [],
  );

  const resetSelected = useCallback(() => {
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!selected) {
      setSelectedSessions([]);
      return;
    }

    const isSelected = (component: Component, course: Course) => {
      if (!selected[course.courseCode]) return false;

      return selected[course.courseCode].some(
        (section: string) => component.subSection === section,
      );
    };

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

  const addCourse = useCallback((course: Course) => {
    setCourses((currCourses) => {
      if (
        currCourses.some(
          (elem) =>
            elem.courseCode === course.courseCode && elem.term === course.term,
        )
      ) {
        return currCourses;
      }
      course.sections.forEach((section) =>
        section.components.forEach((component) => {
          component.isSelected =
            !selected || !selected[course.courseCode]
              ? false
              : selected[course.courseCode].some((section: string) => {
                  return section === component.subSection;
                });
        }),
      );
      return [course, ...currCourses];
    });
  }, []);

  const removeCourse = useCallback((course: Course) => {
    setCourses((currCourses) =>
      currCourses.filter(
        (currCourse) => currCourse.courseCode !== course.courseCode,
      ),
    );

    setSelected((currSelected: Selected) => {
      if (!currSelected) return null;

      const selected = { ...currSelected };
      delete selected[course.courseCode];

      if (Object.keys(selected).length === 0) return null;

      return selected;
    });
  }, []);

  const resetCourses = useCallback(() => {
    setCourses([]);
    resetSelected();
  }, []);

  const changeTerm = useCallback((term: Term) => {
    setTerm(term);
    setCourses([]);
    setSelected({});
  }, []);

  const initializeTerm = useCallback((term: Term) => {
    setTerm(term);
  }, []);

  return (
    <SearchResultsContext.Provider
      value={{
        courses,
        selected,
        addSelected,
        removeSelected,
        resetSelected,
        addCourse,
        removeCourse,
        resetCourses,
        selectedSessions,
        term,
        changeTerm,
        initializeTerm,
        selectRandomColour,
        addAvailableColour,
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
