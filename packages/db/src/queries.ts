import {
  eq,
  and,
  asc,
  sql,
  lt,
  notInArray,
  inArray,
  ilike,
  gte,
  between,
} from "drizzle-orm";
import { db as defaultDb, type Database } from "./index.js";
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
  CourseQueryFilter,
  GetCourseResult,
  GetCourseResultOkValue,
  SessionInsert,
  SubjectInsert,
  Term,
  TermInsert,
} from "./types.js";
import { err, ok, Result, ResultAsync } from "neverthrow";

export async function getAvailableTerms(database: Database = defaultDb) {
  return ResultAsync.fromPromise(
    database
      .select({
        term: availableTermsTable.term,
        value: availableTermsTable.value,
      })
      .from(availableTermsTable)
      .orderBy(asc(availableTermsTable.value)),
    error => new Error(`Failed to fetch available terms: ${error}`),
  );
}

export async function getAvailableSubjects(database: Database = defaultDb) {
  return ResultAsync.fromPromise(
    database
      .select({ subject: availableSubjectsTable.subject })
      .from(availableSubjectsTable)
      .orderBy(asc(availableSubjectsTable.subject)),
    error => new Error(`Failed to fetch available subjects: ${error}`),
  ).map(result => result.map(subject => subject.subject));
}

export async function getAvailableCoursesByTerm(
  term: string,
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
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

export async function getCoursesByFilter(
  filter: CourseQueryFilter,
  database: Database = defaultDb,
) {
  const subject = filter.subject?.trim().toUpperCase() ?? "";
  const yearDigit = filter.year ? String(filter.year).slice(0, 1) : undefined;
  const isGraduateLevel = filter.year !== undefined && filter.year >= 5;
  const language = filter.language;
  const conditions = [eq(coursesTable.term, filter.term)];

  // e.g. "CSI2101" → "2" (first digit = year level)
  const yearLevel = sql<string>`substring(${coursesTable.courseCode} from '[0-9]')`;

  // e.g. "CSI2101" → "1" (second digit = language code: 1-4 english, 5-8 french, 0/9 bilingual)
  const langCode = sql<string>`substring(${coursesTable.courseCode} from '^[A-Za-z]+[0-9]([0-9])')`;

  if (subject) {
    conditions.push(ilike(coursesTable.courseCode, `${subject}%`));
  }

  if (yearDigit && !isGraduateLevel) {
    conditions.push(eq(yearLevel, yearDigit));
  }

  if (yearDigit && isGraduateLevel) {
    conditions.push(gte(yearLevel, "5"));
  }

  if (language === "english") {
    conditions.push(between(langCode, "1", "4"));
  }

  if (language === "french") {
    conditions.push(between(langCode, "5", "8"));
  }

  if (language === "other") {
    conditions.push(inArray(langCode, ["0", "9"]));
  }

  return ResultAsync.fromPromise(
    database
      .select({
        courseCode: coursesTable.courseCode,
        courseTitle: coursesTable.courseTitle,
      })
      .from(coursesTable)
      .where(and(...conditions))
      .orderBy(asc(coursesTable.courseCode))
      .limit(filter.limit ?? 200),
    error => new Error(`Failed to fetch filtered courses: ${error}`),
  );
}

export async function deleteTerms(
  terms: Term[],
  database: Database = defaultDb,
) {
  if (terms.length === 0) {
    ResultAsync.fromPromise(
      Promise.reject(),
      () => new Error("No terms to delete. Skipping."),
    );
  }

  const termsToDelete = terms.map(term => term.value);
  return ResultAsync.fromPromise(
    database
      .delete(availableTermsTable)
      .where(inArray(availableTermsTable.value, termsToDelete)),
    error => new Error(`Failed to delete outdated terms: ${error}`),
  );
}

export async function updateCourses(
  courses: CourseInsert[],
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
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
  courseComponents: CourseComponentInsert[],
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
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

export async function updateSessions(
  sessions: SessionInsert[],
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database.insert(sessionsTable).values(sessions),
    error => new Error(`Failed to update sessions: ${error}`),
  );
}

export async function upsertCourseDetails(
  details: CourseDetailsInsert,
  database: Database = defaultDb,
): Promise<Result<undefined, Error[]>> {
  const coursesUpdated = await updateCourses(details.courses, database);
  const errors = [];
  if (coursesUpdated.isErr()) {
    errors.push(coursesUpdated.error);
  }

  const courseComponentsUpdated = await updateCourseComponents(
    details.courseComponents,
    database,
  );
  if (courseComponentsUpdated.isErr()) {
    errors.push(courseComponentsUpdated.error);
  }

  const sessionsUpdated = await updateSessions(details.sessions, database);
  if (sessionsUpdated.isErr()) {
    errors.push(sessionsUpdated.error);
  }

  return errors.length > 0 ? err(errors) : ok(undefined);
}

export async function updateAvailableTerms(
  terms: TermInsert[],
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
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
  subjects: SubjectInsert[],
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
      .insert(availableSubjectsTable)
      .values(subjects)
      .onConflictDoNothing(),
    error => new Error(`Failed to update available subjects: ${error}`),
  );
}

export async function removeOldSessions(
  milliseconds: number,
  database: Database = defaultDb,
) {
  return ResultAsync.fromPromise(
    database
      .delete(sessionsTable)
      .where(
        lt(sessionsTable.last_updated, new Date(Date.now() - milliseconds)),
      ),
    error => new Error(`Failed to remove outdated sessions: ${error}`),
  );
}

export async function removeCoursesWithNoSessions(
  database: Database = defaultDb,
) {
  const coursesWithSessions = database
    .selectDistinct({ courseCode: sessionsTable.courseCode })
    .from(sessionsTable);

  return ResultAsync.fromPromise(
    database
      .delete(coursesTable)
      .where(notInArray(coursesTable.courseCode, coursesWithSessions)),
    error => new Error(`Failed to remove courses with no sessions: ${error}`),
  );
}

export async function getCourse(
  term: string,
  courseCode: string,
  database: Database = defaultDb,
) {
  return await ResultAsync.fromPromise(
    database.query.coursesTable.findFirst({
      where: and(
        eq(coursesTable.term, term),
        eq(coursesTable.courseCode, courseCode),
      ),
      columns: {
        isDeleted: false,
      },
      with: {
        courseComponents: {
          where: eq(courseComponentsTable.term, term),
          orderBy: courseComponentsTable.subSection,
          columns: {
            courseCode: false,
            term: false,
            isDeleted: false,
          },
          with: {
            sessions: {
              where: (sessions, { and, eq }) =>
                and(
                  eq(sessions.term, term),
                  eq(sessions.courseCode, courseComponentsTable.courseCode),
                  eq(sessions.subSection, courseComponentsTable.subSection),
                  eq(
                    sessions.last_updated,
                    sql`(
                    SELECT MAX(last_updated)
                    FROM sessions
                    WHERE term = ${term}
                      AND course_code = ${courseComponentsTable.courseCode}
                      AND sub_section = ${courseComponentsTable.subSection}
                  )`,
                  ),
                ),
              columns: {
                id: false,
                section: false,
                subSection: false,
                courseCode: false,
                term: false,
                isDeleted: false,
                last_updated: false,
              },
              orderBy: sql`CASE
                WHEN ${sessionsTable.dayOfWeek} = 'Mo' THEN 1
                WHEN ${sessionsTable.dayOfWeek} = 'Tu' THEN 2
                WHEN ${sessionsTable.dayOfWeek} = 'We' THEN 3
                WHEN ${sessionsTable.dayOfWeek} = 'Th' THEN 4
                WHEN ${sessionsTable.dayOfWeek} = 'Fr' THEN 5
                WHEN ${sessionsTable.dayOfWeek} = 'Sa' THEN 6
                WHEN ${sessionsTable.dayOfWeek} = 'Su' THEN 7
                ELSE 8
              END
            `,
            },
          },
        },
      },
    }),
    error =>
      new Error(`Failed to fetch course ${courseCode} in ${term}: ${error}`),
  );
}

export const parseCourse = (course: GetCourseResultOkValue) => {
  const parsedSections = course.courseComponents.reduce(
    (acc, curr) => {
      if (!acc[curr.section]) {
        acc[curr.section] = [curr];
      } else {
        acc[curr.section]?.push(curr);
      }
      return acc;
    },
    {} as Record<string, typeof course.courseComponents>,
  );

  const parsed = {
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    term: course.term,
    sections: parsedSections,
  };

  return parsed;
};

export const processCourse = (course: GetCourseResult) => {
  return course.andThen(result => {
    if (!result) {
      return err(new Error(`Course not found`));
    }

    const parsed = parseCourse(result);
    return ok(parsed);
  });
};
