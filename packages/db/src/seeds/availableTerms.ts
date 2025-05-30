import { availableTermsTable } from "../schema.js";

const availableTerms = [
  {
    term: "2025 Fall Term",
    value: "2259",
  },
  {
    term: "2025 Spring/Summer Term",
    value: "2255",
  },
  {
    term: "2026 Winter Term",
    value: "2261",
  },
];

export async function seedAvailableTerms(db: Database) {
  await db.insert(availableTermsTable).values(availableTerms);
  console.log("Seeded database with available terms");
}
