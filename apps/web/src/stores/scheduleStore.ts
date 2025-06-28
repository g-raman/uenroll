import { Course, Selected, SelectedSession, Term } from "@/types/Types";
import { INITIAL_COLOURS } from "@/utils/constants";
import { createNewSelectedSessions, shuffleArray } from "@/utils/helpers";
import { create } from "zustand";

export interface InitializeDataPayload {
  courseSearchResults: Course[];
  selectedSessionsURL: Selected | null;
  selectedTerm: Term | null;
  availableTerms: Term[];
}

interface ScheduleActions {
  setInitialData: (initialData: InitializeDataPayload) => void;
  changeTerm: (newTerm: Term) => void;
  addCourse: (course: Course) => void;
  removeCourse: (course: Course) => void;
}

interface ScheduleState {
  courseSearchResults: Course[];
  selectedSessionsURL: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  selectedTerm: Term | null;
  availableTerms: Term[];
  actions: ScheduleActions;
}

const useScheduleStore = create<ScheduleState>(set => ({
  courseSearchResults: [],
  selectedSessionsURL: null,
  selectedSessions: [],
  colours: shuffleArray(INITIAL_COLOURS),
  selectedTerm: null,
  availableTerms: [],
  actions: {
    setInitialData: initialData =>
      set(old => {
        const {
          selectedTerm,
          availableTerms,
          courseSearchResults,
          selectedSessionsURL,
        } = initialData;
        const colours = [...old.colours];
        courseSearchResults.forEach(course => (course.colour = colours.pop()));

        const selectedSessions = createNewSelectedSessions(
          courseSearchResults,
          selectedSessionsURL,
        );

        return {
          ...old,
          selectedTerm,
          availableTerms,
          courseSearchResults,
          selectedSessionsURL,
          selectedSessions,
          colours,
        };
      }),
    changeTerm: newTerm =>
      set(old => ({
        ...old,
        selectedTerm: newTerm,
        selectedSessions: [],
        selectedSessionsURL: null,
        courseSearchResults: [],
        colours: shuffleArray(INITIAL_COLOURS),
      })),
    addCourse: course =>
      set(old => {
        const isAlreadyAdded = old.courseSearchResults.some(
          result => result.courseCode === course.courseCode,
        );
        const [colour, ...restColours] = old.colours;

        return isAlreadyAdded
          ? old
          : {
              ...old,
              colours: restColours,
              courses: [{ ...course, colour }, ...old.courseSearchResults],
            };
      }),
    removeCourse: course =>
      set(old => {
        const filteredCourses = old.courseSearchResults.filter(
          result => result.courseCode !== course.courseCode,
        );

        if (
          old.selectedSessionsURL === null ||
          !old.selectedSessionsURL[course.courseCode]
        ) {
          return {
            ...old,
            courses: filteredCourses,
            colours: [...old.colours, course.colour as string],
          };
        }
        const selectedSessionsURL = { ...old.selectedSessionsURL };
        delete selectedSessionsURL[course.courseCode];

        if (Object.keys(selectedSessionsURL).length === 0) {
          return {
            ...old,
            courses: filteredCourses,
            selectedSessionsURL: null,
            selectedSessions: [],
            colours: [...old.colours, course.colour as string],
          };
        }

        const selectedSessions = createNewSelectedSessions(
          filteredCourses,
          selectedSessionsURL,
        );

        return {
          ...old,
          courses: filteredCourses,
          selectedSessionsURL,
          selectedSessions,
          colours: [...old.colours, course.colour as string],
        };
      }),
    resetData: () =>
      set(old => ({
        ...old,
        courses: [],
        selected: null,
        selectedSessions: [],
        colours: shuffleArray(INITIAL_COLOURS),
      })),
  },
}));
