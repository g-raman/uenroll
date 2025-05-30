import { Course, Selected, SelectedKey } from "@/types/Types";
import { createNewSelectedSessions } from "@/utils/helpers";
import {
  AddCoursePayload,
  AddSelectedPayload,
  ChangeTermPayload,
  InitializeDataPayload,
  RemoveCoursePayload,
  RemoveSelectedPayload,
  StateType,
} from "./types";
import { INITIAL_COLOURS } from "@/utils/constants";

export const handleInitializeData = (
  state: StateType,
  action: { type: "initialize_data"; payload: InitializeDataPayload },
) => {
  const { term, availableTerms, courses, selected } = action.payload;
  const colours = [...state.colours];
  courses.forEach(course => (course.colour = colours.pop()));

  const selectedSessions = createNewSelectedSessions(
    courses,
    action.payload.selected,
  );

  return {
    ...state,
    term,
    availableTerms,
    courses,
    selected,
    selectedSessions,
    colours,
  };
};

export const handleChangeTerm = (
  state: StateType,
  action: { type: "change_term"; payload: ChangeTermPayload },
) => {
  return {
    ...state,
    courses: [],
    selected: null,
    selectedSessions: [],
    term: action.payload,
  };
};

export const handleAddCourse = (
  state: StateType,
  action: { type: "add_course"; payload: AddCoursePayload },
) => {
  const courseToAdd = action.payload;
  const isAlreadyAdded = state.courses.some(
    addedCourse => addedCourse.courseCode === courseToAdd.courseCode,
  );
  const [colour, ...restColours] = state.colours;

  return isAlreadyAdded
    ? state
    : {
        ...state,
        colours: restColours,
        courses: [{ ...courseToAdd, colour }, ...state.courses],
      };
};

export const handleRemoveCourse = (
  state: StateType,
  action: { type: "remove_course"; payload: RemoveCoursePayload },
) => {
  const courseToRemove: Course = action.payload;
  const filteredCourses = state.courses.filter(
    addedCourse => addedCourse.courseCode !== courseToRemove.courseCode,
  );

  if (state.selected === null || !state.selected[courseToRemove.courseCode]) {
    return {
      ...state,
      courses: filteredCourses,
      colours: [...state.colours, courseToRemove.colour as string],
    };
  }
  const selected = { ...state.selected };
  delete selected[courseToRemove.courseCode];

  if (Object.keys(selected).length === 0) {
    return {
      ...state,
      courses: filteredCourses,
      selected: null,
      selectedSessions: [],
      colours: [...state.colours, courseToRemove.colour as string],
    };
  }

  const selectedSessions = createNewSelectedSessions(filteredCourses, selected);

  return {
    ...state,
    courses: filteredCourses,
    selected,
    selectedSessions,
    colours: [...state.colours, courseToRemove.colour as string],
  };
};

export const handleResetCourses = (state: StateType) => {
  return {
    ...state,
    courses: [],
    selected: null,
    selectedSessions: [],
    colours: INITIAL_COLOURS,
  };
};

export const handleAddSelected = (
  state: StateType,
  action: { type: "add_selected"; payload: AddSelectedPayload },
) => {
  const { courseCode, subSection }: SelectedKey = action.payload;

  if (state.selected === null) {
    const selected: Selected = {};
    selected[courseCode] = [subSection];
    return {
      ...state,
      selected,
      selectedSessions: createNewSelectedSessions(state.courses, selected),
    };
  } else if (!state.selected[courseCode]) {
    const selected = { ...state.selected };
    selected[courseCode] = [subSection];
    return {
      ...state,
      selected,
      selectedSessions: createNewSelectedSessions(state.courses, selected),
    };
  } else if (
    state.selected[courseCode].some(section => section === subSection)
  ) {
    return {
      ...state,
      selectedSessions: createNewSelectedSessions(
        state.courses,
        state.selected,
      ),
    };
  }

  const selected = { ...state.selected };
  selected[courseCode]?.push(subSection);
  return {
    ...state,
    selected,
    selectedSessions: createNewSelectedSessions(state.courses, selected),
  };
};

export const handleRemoveSelected = (
  state: StateType,
  action: { type: "remove_selected"; payload: RemoveSelectedPayload },
) => {
  const { courseCode, subSection }: SelectedKey = action.payload;

  if (state.selected === null) return state;

  if (!state.selected[courseCode]) return state;

  const filteredSubsections = state.selected[courseCode].filter(
    section => section !== subSection,
  );

  const selected = { ...state.selected };
  selected[courseCode] = filteredSubsections;

  if (filteredSubsections.length === 0) delete selected[courseCode];

  if (Object.keys(selected).length === 0)
    return { ...state, selected: null, selectedSessions: [] };

  const selectedSessions = createNewSelectedSessions(state.courses, selected);

  return {
    ...state,
    selected,
    selectedSessions,
  };
};

export const handleResetSelected = (state: StateType) => {
  return {
    ...state,
    selected: null,
    selectedSessions: [],
  };
};
