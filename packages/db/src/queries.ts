import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { coursesTable } from "./schema.js";

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
