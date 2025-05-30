import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { coursesTable } from "../schema.js";

const courses = [
  {
    courseCode: "ADM1100",
    term: "2255",
    courseTitle: "Introduction to Business (+1 combined)",
  },
  {
    courseCode: "ADM1100",
    term: "2259",
    courseTitle: "Introduction to Business",
  },
  {
    courseCode: "ADM1100",
    term: "2261",
    courseTitle: "Introduction to Business",
  },
  {
    courseCode: "ITI1100",
    term: "2255",
    courseTitle: "Digital Systems I",
  },
  {
    courseCode: "ITI1100",
    term: "2261",
    courseTitle: "Digital Systems I",
  },
  {
    courseCode: "MAT1320",
    term: "2255",
    courseTitle: "Calculus I",
  },
  {
    courseCode: "MAT1320",
    term: "2259",
    courseTitle: "Calculus I",
  },
  {
    courseCode: "MAT1320",
    term: "2261",
    courseTitle: "Calculus I",
  },
  {
    courseCode: "CLA1101",
    term: "2255",
    courseTitle: "Greek Civilization",
  },
  {
    courseCode: "CLA1101",
    term: "2259",
    courseTitle: "Greek Civilization",
  },
];

export async function seedCourses(db: PostgresJsDatabase) {
  await db.insert(coursesTable).values(courses);
  console.log("Seeded database with courses.");
}
