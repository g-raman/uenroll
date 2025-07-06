import { CourseSearchResult } from "@repo/db/types";

export interface ColouredCourse extends CourseSearchResult {
  colour: string;
}

export interface Term {
  term: string;
  value: string;
}

export interface SelectedSession {
  startTime: string;
  endTime: string;
  startRecur: string;
  endRecur: string;
  dayOfWeek: number;
  courseDetails: {
    courseCode: string;
    courseTitle: string;
    term: string;
    subSection: string;
    instructor: string;
    type: string;
    isOpen: boolean;
    backgroundColour: string;
  };
}

export interface Selected {
  [key: string]: string[];
}

export interface SelectedKey {
  courseCode: string;
  subSection: string;
}

export interface CourseAutocomplete {
  courseCode: string;
  courseTitle: string;
}
