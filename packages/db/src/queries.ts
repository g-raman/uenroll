import { eq, asc } from "drizzle-orm";
import { db } from "./index.js";
import { availableTermsTable, coursesTable } from "./schema.js";

export async function getAvailableTerms() {
  return await db
    .select({
      term: availableTermsTable.term,
      value: availableTermsTable.value,
    })
    .from(availableTermsTable)
    .orderBy(asc(availableTermsTable.value));
}

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
