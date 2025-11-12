import { updateAvailableSubjects } from "@repo/db/queries";
import type { SubjectInsert } from "@repo/db/types";
import * as cheerio from "cheerio";
import { logger } from "../utils/logger.js";

const catalogue = await fetch("https://catalogue.uottawa.ca/en/courses/");
const html = await catalogue.text();
const $ = cheerio.load(html);

const SUBJECT_CODE_REGEX = /\(([^()]*)\)(?!.*\([^()]*\))/;
const subjectCodeRegex = new RegExp(SUBJECT_CODE_REGEX);

const subjects: SubjectInsert[] = [];
$(".letternav-head + ul > li").each(function () {
  const subject = $(this).text();
  const isMatch = subjectCodeRegex.test(subject);
  if (!isMatch) {
    logger.error(`Coudln't find a match for ${subject}`);
    return;
  }

  const subjectCode = subjectCodeRegex.exec(subject);
  if (!subjectCode || !subjectCode[1]) {
    logger.error(
      `Something went wrong trying to match for subject: ${subject}`,
    );
    return;
  }

  subjects.push({ subject: subjectCode[1] });
});

// Manual entries for courses that aren't listed in the catalogue
subjects.push({ subject: "PBH" });
subjects.push({ subject: "ADX" });
subjects.push({ subject: "CTM" });
subjects.push({ subject: "DTO" });
subjects.push({ subject: "EHA" });
subjects.push({ subject: "EMC" });
subjects.push({ subject: "ESG" });
subjects.push({ subject: "MEM" });
subjects.push({ subject: "MIA" });
subjects.push({ subject: "POP" });
subjects.push({ subject: "PHM" });

const result = await updateAvailableSubjects(subjects);
if (result.isErr()) {
  logger.error(result.error);
  process.exit(1);
}
process.exit(0);
