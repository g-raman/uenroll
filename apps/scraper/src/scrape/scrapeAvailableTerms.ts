import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../utils/constants.js";
import type { Term } from "../utils/types.js";
import { updateAvailableTerms } from "../supabase.js";
import { fetchCookie } from "../utils/cookies.js";
import { client, db } from "@repo/db";
import { availableTermsTable } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const response = await fetchCookie(COURSE_REGISTRY_URL);
const html = await response.text();
const $ = cheerio.load(html);

const newlyAvailableTerms: Term[] = [];
$("[id='CLASS_SRCH_WRK2_STRM$35$']")
  .find("option")
  .each(function (this) {
    const option = $(this);

    if (option.attr("value") === "") {
      return;
    }
    const term = option.text();
    const value = option.attr("value") as string;

    newlyAvailableTerms.push({
      term,
      value,
    });
  });

const currentAvailableTerms = await db.select().from(availableTermsTable);
await updateAvailableTerms(newlyAvailableTerms);

const termsToDelete = currentAvailableTerms.filter(
  currentAvailableTerm =>
    !newlyAvailableTerms.some(
      newlyAvailableTerm =>
        newlyAvailableTerm.term === currentAvailableTerm.term,
    ),
);
const termsToDeletePromise = termsToDelete.map(termToDelete =>
  db
    .delete(availableTermsTable)
    .where(eq(availableTermsTable.term, termToDelete.term)),
);

const deletionResults = await Promise.allSettled(termsToDeletePromise);
deletionResults.forEach((result, index) => {
  const originalTerm = termsToDelete[index] as Term;

  if (result.status === "fulfilled") {
    console.log(`Successfully deleted outdated term ${originalTerm.term}`);
  } else {
    console.error(
      `Something went wrong when trying to delete outdated term ${originalTerm.term}: ${result.reason.message}`,
    );
  }
});

await client.end();
