import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  availableSubjectsTable,
  availableTermsTable,
  courseComponentsTable,
  coursesTable,
  sessionsTable,
  courseRelations,
  courseComponentsRelations,
  sessionsRelations,
} from "@repo/db/schema";
import { eq, and, asc, sql, lt, notInArray, inArray } from "drizzle-orm";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type { Env } from "./types.js";
import type {
  CourseComponentInsert,
  CourseDetailsInsert,
  CourseInsert,
  SessionInsert,
  SubjectInsert,
  Term,
  TermInsert,
} from "@repo/db/types";

// Re-export schema for use in other modules
export {
  availableSubjectsTable,
  availableTermsTable,
  courseComponentsTable,
  coursesTable,
  sessionsTable,
};

const schema = {
  availableSubjectsTable,
  availableTermsTable,
  courseComponentsTable,
  coursesTable,
  sessionsTable,
  courseRelations,
  courseComponentsRelations,
  sessionsRelations,
};

type Database = PostgresJsDatabase<typeof schema>;

/**
 * Creates a new database client for each request.
 * IMPORTANT: In Cloudflare Workers, you must create a new client per request.
 * Reusing connections across requests is not allowed.
 */
export function createDb(env: Env): Database {
  const client = postgres(env.HYPERDRIVE.connectionString, {
    prepare: false,
    max: 5, // Limit connections per Worker
  });
  return drizzle(client, { schema, casing: "snake_case" });
}

// Database query functions that accept a db instance

export async function getAvailableTerms(db: Database) {
  return ResultAsync.fromPromise(
    db
      .select({
        term: availableTermsTable.term,
        value: availableTermsTable.value,
      })
      .from(availableTermsTable)
      .orderBy(asc(availableTermsTable.value)),
    error => new Error(`Failed to fetch available terms: ${error}`),
  );
}

export async function getAvailableSubjects(db: Database) {
  return ResultAsync.fromPromise(
    db
      .select({ subject: availableSubjectsTable.subject })
      .from(availableSubjectsTable)
      .orderBy(asc(availableSubjectsTable.subject)),
    error => new Error(`Failed to fetch available subjects: ${error}`),
  ).map(result => result.map(subject => subject.subject));
}

export async function deleteTerms(db: Database, terms: Term[]) {
  if (terms.length === 0) {
    return ok(undefined);
  }

  const termsToDelete = terms.map(term => term.value);
  return ResultAsync.fromPromise(
    db
      .delete(availableTermsTable)
      .where(inArray(availableTermsTable.value, termsToDelete)),
    error => new Error(`Failed to delete outdated terms: ${error}`),
  );
}

export async function updateCourses(db: Database, courses: CourseInsert[]) {
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
}

export async function updateCourseComponents(
  db: Database,
  courseComponents: CourseComponentInsert[],
) {
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
}

export async function updateSessions(db: Database, sessions: SessionInsert[]) {
  return ResultAsync.fromPromise(
    db.insert(sessionsTable).values(sessions),
    error => new Error(`Failed to update sessions: ${error}`),
  );
}

export async function upsertCourseDetails(
  db: Database,
  details: CourseDetailsInsert,
): Promise<Result<undefined, Error[]>> {
  const coursesUpdated = await updateCourses(db, details.courses);
  const errors: Error[] = [];
  if (coursesUpdated.isErr()) {
    errors.push(coursesUpdated.error);
  }

  const courseComponentsUpdated = await updateCourseComponents(
    db,
    details.courseComponents,
  );
  if (courseComponentsUpdated.isErr()) {
    errors.push(courseComponentsUpdated.error);
  }

  const sessionsUpdated = await updateSessions(db, details.sessions);
  if (sessionsUpdated.isErr()) {
    errors.push(sessionsUpdated.error);
  }

  return errors.length > 0 ? err(errors) : ok(undefined);
}

export async function updateAvailableTerms(db: Database, terms: TermInsert[]) {
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
}

export async function updateAvailableSubjects(
  db: Database,
  subjects: SubjectInsert[],
) {
  return ResultAsync.fromPromise(
    db.insert(availableSubjectsTable).values(subjects).onConflictDoNothing(),
    error => new Error(`Failed to update available subjects: ${error}`),
  );
}

export async function removeOldSessions(db: Database, milliseconds: number) {
  return ResultAsync.fromPromise(
    db
      .delete(sessionsTable)
      .where(
        lt(sessionsTable.last_updated, new Date(Date.now() - milliseconds)),
      ),
    error => new Error(`Failed to remove outdated sessions: ${error}`),
  );
}

export async function removeCoursesWithNoSessions(db: Database) {
  const coursesWithSessions = db
    .selectDistinct({ courseCode: sessionsTable.courseCode })
    .from(sessionsTable);

  return ResultAsync.fromPromise(
    db
      .delete(coursesTable)
      .where(notInArray(coursesTable.courseCode, coursesWithSessions)),
    error => new Error(`Failed to remove courses with no sessions: ${error}`),
  );
}
