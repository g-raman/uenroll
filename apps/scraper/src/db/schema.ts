import {
  boolean,
  date,
  foreignKey,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const readPolicy = pgPolicy("read access for all users policy", {
  for: "select",
  to: "public",
  using: sql`true`,
});

export const availableTermsTable = pgTable(
  "available_terms",
  {
    term: text().primaryKey(),
    value: text().notNull().unique(),
    isDeleted: boolean().notNull().default(false),
  },
  () => [readPolicy],
).enableRLS();

export const availableSubjectsTable = pgTable(
  "available_subjects",
  {
    subject: text().primaryKey(),
    isDeleted: boolean().notNull().default(false),
  },
  () => [readPolicy],
).enableRLS();

export const coursesTable = pgTable(
  "courses",
  {
    courseCode: text().notNull().unique(),
    term: text()
      .notNull()
      .references(() => availableTermsTable.value, {
        onDelete: "cascade",
      }),
    courseTitle: text().notNull(),
    isDeleted: boolean().notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.courseCode, table.term] }),
    readPolicy,
  ],
).enableRLS();

export const courseComponentsTable = pgTable(
  "course_components",
  {
    courseCode: text().notNull(),
    term: text().notNull(),
    subSection: text(),
    section: text().notNull(),
    isOpen: boolean().notNull(),
    type: text().notNull(),
    isDeleted: boolean().notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.courseCode, table.term, table.subSection] }),
    foreignKey({
      columns: [table.courseCode, table.term],
      foreignColumns: [coursesTable.courseCode, coursesTable.term],
      name: "course_fk",
    }).onDelete("cascade"),
    readPolicy,
  ],
).enableRLS();

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey(),
    courseCode: text().notNull(),
    term: text().notNull(),
    subSection: text().notNull(),
    section: text().notNull(),
    dayOfWeek: text().notNull(),
    startTime: time().notNull(),
    endTime: time().notNull(),
    startDate: date().notNull(),
    endDate: date().notNull(),
    instructor: text().notNull(),
    isDeleted: boolean().default(false),
    last_updated: timestamp().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseCode, table.term, table.subSection],
      foreignColumns: [
        courseComponentsTable.courseCode,
        courseComponentsTable.term,
        courseComponentsTable.subSection,
      ],
      name: "course_component_fk",
    }).onDelete("cascade"),
    readPolicy,
  ],
).enableRLS();
