import "dotenv/config";

import type {
  Course,
  CourseComponent,
  CourseDetails,
  Session,
  Subject,
  Term,
} from "./utils/types.ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  availableSubjectsTable,
  availableTermsTable,
  courseComponentsTable,
  coursesTable,
  sessionsTable,
} from "./db/schema";
import { asc, lt, notInArray, sql } from "drizzle-orm";

const connectionString = process.env["DATABASE_URL"] as string;
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { casing: "snake_case" });

const getAvailableTerms = async (): Promise<Term[]> => {
  try {
    const result = await db
      .select({
        term: availableTermsTable.term,
        value: availableTermsTable.value,
      })
      .from(availableTermsTable)
      .orderBy(asc(availableTermsTable.term));

    return result;
  } catch (error) {
    console.error(
      "Something went wrong when fetching available terms: " + error,
    );
  }
  return [];
};

export const getAvailableSubjects = async () => {
  try {
    const results = await db
      .select({ subject: availableSubjectsTable.subject })
      .from(availableSubjectsTable)
      .orderBy(asc(availableSubjectsTable.subject));

    return results.map((result) => result.subject);
  } catch (error) {
    console.error(
      "Something went wrong when fetching available subjects:\n" + error,
    );
  }
  return [];
};

export const upsertCourseDetails = async (
  details: CourseDetails,
): Promise<void> => {
  try {
    await updateCourses(details.courses);
    await updateCourseComponents(details.courseComponents);
    await updateSessions(details.sessions);

    for (const course of details.courses) {
      console.log(`Updated details for ${course.courseCode}`);
    }
  } catch (error) {
    console.error(error);
  }
};

export const updateCourses = async (courses: Course[]) => {
  try {
    await db
      .insert(coursesTable)
      .values(courses)
      .onConflictDoUpdate({
        target: [coursesTable.courseCode, coursesTable.term],
        set: {
          courseTitle: sql`excluded.course_title`,
        },
      });
  } catch (error) {
    throw new Error("Something went wrong when inserting courses:\n" + error);
  }
};

export const updateCourseComponents = async (
  courseComponents: CourseComponent[],
) => {
  try {
    await db
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
      });
  } catch (error) {
    throw new Error(
      "Something went wrong when inserting course components:\n" + error,
    );
  }
};

export const updateSessions = async (sessions: Session[]) => {
  try {
    await db.insert(sessionsTable).values(sessions);
  } catch (error) {
    throw new Error("Something went wrong when inserting sessions:\n" + error);
  }
};

export const updateAvailableTerms = async (terms: Term[]): Promise<void> => {
  try {
    await db
      .insert(availableTermsTable)
      .values(terms)
      .onConflictDoUpdate({
        target: availableTermsTable.term,
        set: {
          value: sql`excluded.value`,
        },
      });

    console.log("Success: Updated available terms");
  } catch (error) {
    console.error(
      "Error: Something went wrong when updating availabe terms: ",
      error,
    );
  }
};

export const updateAvailableSubjects = async (
  subjects: Subject[],
): Promise<void> => {
  try {
    await db
      .insert(availableSubjectsTable)
      .values(subjects)
      .onConflictDoNothing();

    console.log("Success: Updated available subjects");
  } catch (error) {
    console.error(
      "Error: Something went wrong when updating availabe subjects: ",
      error,
    );
  }
};

export const removeOldSessions = async (milliseconds: number) => {
  try {
    await db
      .delete(sessionsTable)
      .where(
        lt(sessionsTable.last_updated, new Date(Date.now() - milliseconds)),
      );
  } catch (error) {
    console.error(
      "Error: Something went wrong when deleting old sessions",
      error,
    );
  }
};

export const removeCoursesWithNoSessions = async () => {
  try {
    const coursesWithSessions = db
      .selectDistinct({ courseCode: sessionsTable.courseCode })
      .from(sessionsTable);

    const coursesWithoutSessions = await db
      .delete(coursesTable)
      .where(notInArray(coursesTable.courseCode, coursesWithSessions));

    return coursesWithoutSessions;
  } catch (error) {
    console.error(
      "Error: Something went wrong when deleting courses with no sessions",
      error,
    );
  }
};

export default getAvailableTerms;
