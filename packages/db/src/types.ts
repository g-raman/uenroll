import type { Result } from "neverthrow";
import type { getCourse, processCourse } from "./queries.js";
import {
  courseComponentsTable,
  coursesTable,
  sessionsTable,
  type availableSubjectsTable,
  type availableTermsTable,
} from "./schema.js";

export type Term = Omit<typeof availableTermsTable.$inferSelect, "isDeleted">;
export type Subject = typeof availableSubjectsTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type CourseComponent = typeof courseComponentsTable.$inferSelect;
export type Session = Omit<
  typeof sessionsTable.$inferSelect,
  | "term"
  | "courseCode"
  | "section"
  | "subSection"
  | "id"
  | "isDeleted"
  | "last_updated"
>;

export type TermInsert = typeof availableTermsTable.$inferInsert;
export type SubjectInsert = typeof availableSubjectsTable.$inferInsert;
export type CourseInsert = typeof coursesTable.$inferInsert;
export type CourseComponentInsert = typeof courseComponentsTable.$inferInsert;
export type SessionInsert = typeof sessionsTable.$inferInsert;

export type CourseDetailsInsert = {
  courses: CourseInsert[];
  courseComponents: CourseComponentInsert[];
  sessions: SessionInsert[];
};

export type GetCourseResult = Awaited<ReturnType<typeof getCourse>>;
export type CourseSearchResult =
  ReturnType<typeof processCourse> extends Result<infer T, unknown> ? T : never;
export type Section = CourseSearchResult["sections"][string][number];
