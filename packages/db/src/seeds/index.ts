import { client, db } from "../index.js";
import { seedAvailableSubjects } from "./availableSubjects.js";
import { seedAvailableTerms } from "./availableTerms.js";
import { seedCourseComponents } from "./courseComponents.js";
import { seedCourses } from "./courses.js";
import { seedSessions } from "./sessions.js";

async function main() {
  await seedAvailableSubjects(db);
  await seedAvailableTerms(db);
  await seedCourses(db);
  await seedCourseComponents(db);
  await seedSessions(db);
}

main();

await client.end();
process.exit(0);
