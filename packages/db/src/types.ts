import {
  courseComponentsTable,
  coursesTable,
  sessionsTable,
  type availableSubjectsTable,
  type availableTermsTable,
} from "./schema.js";

export type Term = typeof availableTermsTable.$inferSelect;
export type Subject = typeof availableSubjectsTable.$inferSelect;
export type Course = typeof coursesTable.$inferSelect;
export type CourseComponent = typeof courseComponentsTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;

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
