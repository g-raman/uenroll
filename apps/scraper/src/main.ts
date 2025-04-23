import scrapeSearchResults from "./scrape/scrapeSearchResults.ts";
import getAvailableTerms, {
  client,
  getAvailableSubjects,
  upsertCourseDetails,
} from "./supabase.ts";
import { FIRST_YEAR, LAST_YEAR } from "./utils/constants.ts";
import "jsr:@std/dotenv/load";
import * as cheerio from "cheerio";
import { getError } from "./utils/scrape.ts";
import getSubjectByYear from "./scrape/getSubjectByYear.ts";

const terms = await getAvailableTerms();

const courses = await getAvailableSubjects();

for (const term of terms) {
  for (const course of courses) {
    for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
      console.log(`Searching for ${course} year ${year} courses:`);
      const html = await getSubjectByYear(term, year, course);
      if (html.length === 0) continue;

      const parser = cheerio.load(html);

      const error = getError(parser);
      if (error != null) {
        console.log(error + "\n");
        continue;
      }

      const results = scrapeSearchResults(parser, term);
      console.log("Results scraped.");
      if (
        results.courses.length === 0 ||
        results.courseComponents.length === 0 ||
        results.sessions.length === 0
      ) {
        console.log("No results found.");
      } else {
        await upsertCourseDetails(results);
      }

      console.log(`Year ${year} processing complete.\n`);
    }
  }
}

await client.end();
process.exit(0);
