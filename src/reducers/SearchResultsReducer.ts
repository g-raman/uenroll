import {
  handleAddCourse,
  handleAddSelected,
  handleChangeTerm,
  handleInitializeData,
  handleRemoveCourse,
  handleRemoveSelected,
  handleResetCourses,
  handleResetSelected,
} from "./SearchResultsActions";
import { ActionType, StateType } from "./types";

export const searchResultsRedcuer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case "initialize_data":
      return handleInitializeData(state, action);

    case "change_term":
      return handleChangeTerm(state, action);

    case "add_course":
      return handleAddCourse(state, action);

    case "remove_course":
      return handleRemoveCourse(state, action);

    case "reset_courses":
      return handleResetCourses(state);

    case "add_selected":
      return handleAddSelected(state, action);

    case "remove_selected":
      return handleRemoveSelected(state, action);

    case "reset_selected":
      return handleResetSelected(state);

    default:
      return state;
  }
};
