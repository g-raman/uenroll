import { courseToCourseWithSectionAlternatives } from "@/utils/mappers/course";
import { CourseSearchResult, Section } from "@repo/db/types";

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

export type Expand<T> = {
  [K in keyof T]: T[K];
};

export interface ISectionWithAlternatives extends Section {
  alternatives: string[];
}

export interface IScheduleItem extends ISectionWithAlternatives {
  courseCode: string;
  courseTitle: string;
  colour: string;
  term: string;
}

export type ScheduleItem = Expand<IScheduleItem>;
export type SectionWithAlternatives = Expand<ISectionWithAlternatives>;

export type CourseWithSectionAlternatives = ReturnType<
  typeof courseToCourseWithSectionAlternatives
>;
