import { eq, asc } from "drizzle-orm";
import { db } from "./index.js";
import {
  availableSubjectsTable,
  availableTermsTable,
  coursesTable,
} from "./schema.js";

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
