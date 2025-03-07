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
import { dayOfWeekToNumberMap, INITIAL_COLOURS } from "@/utils/constants";
import { createSession, shuffleArray } from "@/utils/helpers";

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

const shuffledColours = shuffleArray(INITIAL_COLOURS);

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
