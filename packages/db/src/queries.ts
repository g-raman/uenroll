import { eq, asc, sql, lt, notInArray } from "drizzle-orm";
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
  CourseInsert,
  SessionInsert,
  SubjectInsert,
  TermInsert,
} from "./types.js";

export async function getAvailableTerms() {
  return await db
    .select({
      term: availableTermsTable.term,
      value: availableTermsTable.value,
    })
    .from(availableTermsTable)
    .orderBy(asc(availableTermsTable.value));
}

export const getAvailableSubjects = async () => {
  const results = await await db
    .select({ subject: availableSubjectsTable.subject })
    .from(availableSubjectsTable)
    .orderBy(asc(availableSubjectsTable.subject));

  return results.map(subject => subject.subject);
};

export async function getAvailableCoursesByTerm(term: string) {
  return await db
    .select({
      courseCode: coursesTable.courseCode,
      courseTitle: coursesTable.courseTitle,
    })
    .from(coursesTable)
    .where(eq(coursesTable.term, term))
    .limit(3500);
}

export const updateCourses = async (courses: CourseInsert[]) => {
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
  courseComponents: CourseComponentInsert[],
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

export const updateSessions = async (sessions: SessionInsert[]) => {
  try {
    await db.insert(sessionsTable).values(sessions);
  } catch (error) {
    throw new Error("Something went wrong when inserting sessions:\n" + error);
  }
};

export const updateAvailableTerms = async (
  terms: TermInsert[],
): Promise<void> => {
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
  subjects: SubjectInsert[],
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
