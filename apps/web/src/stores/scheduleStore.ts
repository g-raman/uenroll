import { ColouredCourse, Selected, SelectedSession, Term } from "@/types/Types";
import { INITIAL_COLOURS } from "@/utils/constants";
import { createNewSelectedSessions, shuffleArray } from "@/utils/helpers";
import { CourseSearchResult } from "@repo/db/types";
import { create } from "zustand";

export interface InitializeDataPayload {
  courseSearchResults: ColouredCourse[];
  selectedSessionsURL: Selected | null;
  selectedTerm: Term | null;
  availableTerms: Term[];
}

export interface SelectedSessionKey {
  courseCode: string;
  subSection: string;
}

export type AddSessionPayload = SelectedSessionKey;
export type RemoveSessionPayload = SelectedSessionKey;

interface ScheduleActions {
  setInitialData: (initialData: InitializeDataPayload) => void;
  changeTerm: (newTerm: Term) => void;
  addCourse: (course: CourseSearchResult) => void;
  removeCourse: (course: ColouredCourse) => void;
  resetData: () => void;
  addSession: (session: AddSessionPayload) => void;
  removeSession: (session: RemoveSessionPayload) => void;
  resetSelectedSessions: () => void;
}

interface ScheduleState {
  courseSearchResults: ColouredCourse[];
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
        const newColour = colours.pop() || "";
        const colouredCourses = courseSearchResults.map(course => ({
          ...course,
          colour: newColour,
        }));

        const selectedSessions = createNewSelectedSessions(
          colouredCourses,
          selectedSessionsURL,
        );

        return {
          selectedTerm,
          availableTerms,
          courseSearchResults: colouredCourses,
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
        const newColour = colour || "";

        return isAlreadyAdded
          ? old
          : {
              ...old,
              colours: restColours,
              courseSearchResults: [
                { ...course, colour: newColour },
                ...old.courseSearchResults,
              ],
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
            courseSearchResults: filteredCourses,
            colours: [...old.colours, course.colour],
          };
        }
        const selectedSessionsURL = { ...old.selectedSessionsURL };
        delete selectedSessionsURL[course.courseCode];

        if (Object.keys(selectedSessionsURL).length === 0) {
          return {
            ...old,
            courseSearchResults: filteredCourses,
            selectedSessionsURL: null,
            selectedSessions: [],
            colours: [...old.colours, course.colour],
          };
        }

        const selectedSessions = createNewSelectedSessions(
          filteredCourses,
          selectedSessionsURL,
        );

        return {
          ...old,
          courseSearchResults: filteredCourses,
          selectedSessionsURL,
          selectedSessions,
          colours: [...old.colours, course.colour],
        };
      }),
    resetData: () =>
      set(old => ({
        ...old,
        courseSearchResults: [],
        selectedSessionsURL: null,
        selectedSessions: [],
        colours: shuffleArray(INITIAL_COLOURS),
      })),
    addSession: session =>
      set(old => {
        const { courseCode, subSection } = session;

        if (old.selectedSessionsURL === null) {
          const selectedSessionsURL: Selected = {};
          selectedSessionsURL[courseCode] = [subSection];
          return {
            ...old,
            selectedSessionsURL,
            selectedSessions: createNewSelectedSessions(
              old.courseSearchResults,
              selectedSessionsURL,
            ),
          };
        } else if (!old.selectedSessionsURL[courseCode]) {
          const selectedSessionsURL = { ...old.selectedSessionsURL };
          selectedSessionsURL[courseCode] = [subSection];
          return {
            ...old,
            selectedSessionsURL,
            selectedSessions: createNewSelectedSessions(
              old.courseSearchResults,
              selectedSessionsURL,
            ),
          };
        } else if (
          old.selectedSessionsURL[courseCode].some(
            section => section === subSection,
          )
        ) {
          return old;
        }

        const selectedSessionsURL = { ...old.selectedSessionsURL };
        selectedSessionsURL[courseCode]?.push(subSection);
        return {
          ...old,
          selectedSessionsURL,
          selectedSessions: createNewSelectedSessions(
            old.courseSearchResults,
            selectedSessionsURL,
          ),
        };
      }),
    removeSession: session =>
      set(old => {
        const { courseCode, subSection } = session;

        if (old.selectedSessionsURL === null) return old;

        if (!old.selectedSessionsURL[courseCode]) return old;

        const filteredSubsections = old.selectedSessionsURL[courseCode].filter(
          section => section !== subSection,
        );

        const selectedSessionsURL = { ...old.selectedSessionsURL };
        selectedSessionsURL[courseCode] = filteredSubsections;

        if (filteredSubsections.length === 0)
          delete selectedSessionsURL[courseCode];

        if (Object.keys(selectedSessionsURL).length === 0)
          return { ...old, selectedSessionsURL: null, selectedSessions: [] };

        const selectedSessions = createNewSelectedSessions(
          old.courseSearchResults,
          selectedSessionsURL,
        );

        return {
          ...old,
          selectedSessionsURL,
          selectedSessions,
        };
      }),
    resetSelectedSessions: () =>
      set(old => ({
        ...old,
        selectedSessions: [],
        selectedSessionsURL: null,
      })),
  },
}));

export const useSelectedSessionsURL = () =>
  useScheduleStore(state => state.selectedSessionsURL);

export const useSelectedSessions = () =>
  useScheduleStore(state => state.selectedSessions);

export const useSelectedTerm = () =>
  useScheduleStore(state => state.selectedTerm);

export const useScheduleActions = () =>
  useScheduleStore(state => state.actions);

export const useAvailableTerms = () =>
  useScheduleStore(state => state.availableTerms);

export const useCourseSearchResults = () =>
  useScheduleStore(state => state.courseSearchResults);
