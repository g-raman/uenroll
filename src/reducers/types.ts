import {
  Course,
  Selected,
  SelectedKey,
  SelectedSession,
  Term,
} from "@/types/Types";

export type InitializeDataPayload = {
  courses: Course[];
  selected: Selected | null;
  term: Term;
  availableTerms: Term[];
};

export type ChangeTermPayload = Term;
export type AddCoursePayload = Course;
export type RemoveCoursePayload = Course;
export type AddSelectedPayload = SelectedKey;
export type RemoveSelectedPayload = SelectedKey;

export interface StateType {
  courses: Course[];
  selected: Selected | null;
  selectedSessions: SelectedSession[];
  colours: string[];
  term: Term | null;
  availableTerms: Term[];
}

export type ActionType =
  | {
      type: "initialize_data";
      payload: {
        courses: Course[];
        selected: Selected | null;
        term: Term;
        availableTerms: Term[];
      };
    }
  | { type: "change_term"; payload: Term }
  | { type: "add_course"; payload: Course }
  | { type: "remove_course"; payload: Course }
  | { type: "reset_courses" }
  | { type: "add_selected"; payload: SelectedKey }
  | { type: "remove_selected"; payload: SelectedKey }
  | { type: "reset_selected" };
