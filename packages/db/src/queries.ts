import { eq, asc, sql, lt, notInArray, inArray } from "drizzle-orm";
import { db } from "./index.js";
import {
  availableSubjectsTable,
  availableTermsTable,
  courseComponentsTable,
  coursesTable,
  sessionsTable,
} from "./schema.js";
import type {
  CourseComponentInsert,
  CourseDetailsInsert,
  CourseInsert,
  SessionInsert,
  SubjectInsert,
  Term,
  TermInsert,
} from "./types.js";
import { err, ok, Result, ResultAsync } from "neverthrow";

export async function getAvailableTerms() {
  return ResultAsync.fromPromise(
    db
      .select()
      .from(availableTermsTable)
      .orderBy(asc(availableTermsTable.value)),
    error => new Error(`Failed to fetch available terms: ${error}`),
  );
}

export const getAvailableSubjects = async () => {
  return ResultAsync.fromPromise(
    db
      .select({ subject: availableSubjectsTable.subject })
      .from(availableSubjectsTable)
      .orderBy(asc(availableSubjectsTable.subject)),
    error => new Error(`Failed to fetch available subjects: ${error}`),
  ).map(result => result.map(subject => subject.subject));
};

export async function getAvailableCoursesByTerm(term: string) {
  return ResultAsync.fromPromise(
    db
      .select({
        courseCode: coursesTable.courseCode,
        courseTitle: coursesTable.courseTitle,
      })
      .from(coursesTable)
      .where(eq(coursesTable.term, term))
      .limit(3500),
    error =>
      new Error(`Failed to fetch available courses for the ${term}: ${error}`),
  );
}

export async function deleteTerms(terms: Term[]) {
  if (terms.length === 0) {
    ResultAsync.fromPromise(
      Promise.reject(),
      () => new Error("No terms to delete. Skipping."),
    );
  }

  const termsToDelete = terms.map(term => term.value);
  return ResultAsync.fromPromise(
    db
      .delete(availableTermsTable)
      .where(inArray(availableTermsTable.value, termsToDelete)),
    error => new Error(`Failed to delete outdated terms: ${error}`),
  );
}

export const updateCourses = async (courses: CourseInsert[]) => {
  return ResultAsync.fromPromise(
    db
      .insert(coursesTable)
      .values(courses)
      .onConflictDoUpdate({
        target: [coursesTable.courseCode, coursesTable.term],
        set: {
          courseTitle: sql`excluded.course_title`,
        },
      }),
    error => new Error(`Failed to update courses: ${error}`),
  );
};

export const updateCourseComponents = async (
  courseComponents: CourseComponentInsert[],
) => {
  return ResultAsync.fromPromise(
    db
      .insert(courseComponentsTable)
      .values(courseComponents)
      .onConflictDoUpdate({
        target: [
          courseComponentsTable.courseCode,
          courseComponentsTable.term,
          courseComponentsTable.subSection,
        ],
        set: {
          section: sql`excluded.section`,
          type: sql`excluded.type`,
        },
      }),
    error => new Error(`Failed to update course components: ${error}`),
  );
};

export const updateSessions = async (sessions: SessionInsert[]) => {
  return ResultAsync.fromPromise(
    db.insert(sessionsTable).values(sessions),
    error => new Error(`Failed to update sessions: ${error}`),
  );
};

export const upsertCourseDetails = async (
  details: CourseDetailsInsert,
): Promise<Result<undefined, Error[]>> => {
  const coursesUpdated = await updateCourses(details.courses);
  const errors = [];
  if (coursesUpdated.isErr()) {
    console.error(coursesUpdated.error);
    errors.push(coursesUpdated.error);
  }

  const courseComponentsUpdated = await updateCourseComponents(
    details.courseComponents,
  );
  if (courseComponentsUpdated.isErr()) {
    console.error(courseComponentsUpdated.error);
    errors.push(courseComponentsUpdated.error);
  }

  const sessionsUpdated = await updateSessions(details.sessions);
  if (sessionsUpdated.isErr()) {
    console.error(sessionsUpdated.error);
    errors.push(sessionsUpdated.error);
  }

  for (const course of details.courses) {
    console.log(`Updated details for ${course.courseCode}`);
  }

  return errors.length > 0 ? err(errors) : ok(undefined);
};

export const updateAvailableTerms = async (terms: TermInsert[]) => {
  return ResultAsync.fromPromise(
    db
      .insert(availableTermsTable)
      .values(terms)
      .onConflictDoUpdate({
        target: availableTermsTable.term,
        set: {
          value: sql`excluded.value`,
        },
      }),
    error => new Error(`Failed to update available terms: ${error}`),
  );
};

export const updateAvailableSubjects = async (subjects: SubjectInsert[]) => {
  return ResultAsync.fromPromise(
    db.insert(availableSubjectsTable).values(subjects).onConflictDoNothing(),
    error => new Error(`Failed to update available subjects: ${error}`),
  );
};

export const removeOldSessions = async (milliseconds: number) => {
  return ResultAsync.fromPromise(
    db
      .delete(sessionsTable)
      .where(
        lt(sessionsTable.last_updated, new Date(Date.now() - milliseconds)),
      ),
    error => new Error(`Failed to remove outdated sessions: ${error}`),
  );
};

export const removeCoursesWithNoSessions = async () => {
  const coursesWithSessions = db
    .selectDistinct({ courseCode: sessionsTable.courseCode })
    .from(sessionsTable);

  return ResultAsync.fromPromise(
    db
      .delete(coursesTable)
      .where(notInArray(coursesTable.courseCode, coursesWithSessions)),
    error => new Error(`Failed to remove courses with no sessions: ${error}`),
  );
};
