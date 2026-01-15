import type { SubjectInsert } from "@repo/db/types";
import { err, ok, ResultAsync, type Result } from "neverthrow";
import { COURSE_CATALOGUE_URL } from "../utils/constants.js";
import * as cheerio from "cheerio";

/**
 * Scrape available subjects from the course catalogue
 */
export async function scrapeAvailableSubjects(): Promise<
  Result<SubjectInsert[], Error>
> {
  const response = await ResultAsync.fromPromise(
    fetch(COURSE_CATALOGUE_URL),
    error => new Error(`Failed to fetch course catalogue: ${error}`),
  );

  if (response.isErr()) {
    return err(response.error);
  }

  const html = await ResultAsync.fromPromise(
    response.value.text(),
    error => new Error(`Failed to get HTML text: ${error}`),
  );

  if (html.isErr()) {
    return err(html.error);
  }

  const $ = cheerio.load(html.value);
  const SUBJECT_CODE_REGEX = /\(([^()]*)\)(?!.*\([^()]*\))/;
  const subjectCodeRegex = new RegExp(SUBJECT_CODE_REGEX);

  const subjects: SubjectInsert[] = [];

  $(".letternav-head + ul > li").each(function () {
    const subject = $(this).text();
    const isMatch = subjectCodeRegex.test(subject);
    if (!isMatch) {
      console.log(`Couldn't find a match for ${subject}`);
      return;
    }

    const subjectCode = subjectCodeRegex.exec(subject);
    if (!subjectCode || !subjectCode[1]) {
      console.log(
        `Something went wrong trying to match for subject: ${subject}`,
      );
      return;
    }

    subjects.push({ subject: subjectCode[1] });
  });

  // Manual entries for courses that aren't listed in the catalogue
  const manualSubjects = [
    "PBH",
    "ADX",
    "CTM",
    "DTO",
    "EHA",
    "EMC",
    "ESG",
    "MEM",
    "MIA",
    "POP",
    "PHM",
  ];
  for (const subject of manualSubjects) {
    subjects.push({ subject });
  }

  return ok(subjects);
}
