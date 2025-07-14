import scrapeSearchResults from "./scrape/scrapeSearchResults.js";
import { FIRST_YEAR, LAST_YEAR } from "./utils/constants.js";
import "dotenv/config";
import * as cheerio from "cheerio";
import { getError } from "./utils/scrape.js";
import getSubjectByYear from "./scrape/getSubjectByYear.js";
import {
  upsertCourseDetails,
  getAvailableTerms,
  getAvailableSubjects,
} from "@repo/db/queries";
import { err, ok, Result } from "neverthrow";
import type { CourseDetailsInsert, Term } from "@repo/db/types";
import { logger } from "./utils/logger.js";

const terms = await getAvailableTerms();
if (terms.isErr()) {
  console.error(terms.error);
  process.exit(1);
}

const subjects = await getAvailableSubjects();
if (subjects.isErr()) {
  console.error(subjects.error);
  process.exit(1);
}

const handleScraping = async (
  term: Term,
  year: number,
  course: string,
  english = true,
  french = true,
): Promise<Result<CourseDetailsInsert, Error>> => {
  const html = await getSubjectByYear(term, year, course, english, french);
  if (html.isErr()) {
    return err(html.error);
  }

  if (html.value.length === 0) return err(new Error("HTML didn't load"));
  const parser = cheerio.load(html.value);
  const error = getError(parser);

  if (error != null) {
    return err(new Error(error));
  }

  const results = scrapeSearchResults(parser, term);
  if (
    results.courses.length === 0 ||
    results.courseComponents.length === 0 ||
    results.sessions.length === 0
  ) {
    return err(new Error("No search results found."));
  }

  return ok(results);
};

for (const term of terms.value) {
  logger.info(`Searching for courses in term ${term.term}`);
  for (const subject of subjects.value) {
    for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
      logger.info(`Searching for subject ${subject} in year ${year}`);
      const bothLanguages = await handleScraping(term, year, subject);

      if (
        bothLanguages.isErr() &&
        bothLanguages.error.message === "Search results exceed 300 items."
      ) {
        logger.info("Searching for English and French courses separately");
        const english = await handleScraping(term, year, subject, true, false);
        if (english.isErr()) {
          logger.error(english.error + "\n");
          continue;
        }
        await upsertCourseDetails(english.value);
        logger.info("Updated English courses.\n");

        const french = await handleScraping(term, year, subject, false, true);
        if (french.isErr()) {
          logger.error(french.error + "\n");
          continue;
        }
        await upsertCourseDetails(french.value);
        logger.info("Updated French courses.\n");
      } else if (bothLanguages.isErr()) {
        logger.error(bothLanguages.error.message + "\n");
        continue;
      } else {
        await upsertCourseDetails(bothLanguages.value);
      }

      logger.info(`Year ${year} processing complete.\n`);
    }
  }
}

process.exit(0);
