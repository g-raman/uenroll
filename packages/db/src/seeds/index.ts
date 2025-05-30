import { client, db, type Database } from "../index.js";
import { seedAvailableSubjects } from "./availableSubjects.js";
import { seedAvailableTerms } from "./availableTerms.js";
import { seedCourseComponents } from "./courseComponents.js";
import { seedCourses } from "./courses.js";
import { seedSessions } from "./sessions.js";
import * as schema from "../schema.js";

async function clean(db: Database) {
  await db.delete(schema.sessionsTable);
  await db.delete(schema.courseComponentsTable);
  await db.delete(schema.coursesTable);
  await db.delete(schema.availableTermsTable);
  await db.delete(schema.availableSubjectsTable);

  console.log("Cleared existing data.");
}

async function main() {
  await clean(db);
  await seedAvailableSubjects(db);
  await seedAvailableTerms(db);
  await seedCourses(db);
  await seedCourseComponents(db);
  await seedSessions(db);
}

main();

await client.end();
process.exit(0);
