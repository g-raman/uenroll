import * as cheerio from "cheerio";
import { updateAvailableSubjects } from "@repo/db/queries";
import type { Subject } from "@repo/db/types";
import { getBrowser, getBrowserEndpoint } from "./browser.js";
import { logger } from "../../utils/logger.js";
import { COURSE_REGISTRY_URL } from "../../utils/constants.js";
import { getIdSelector, getIdStartsWithSelector } from "../../utils/scrape.js";

const characters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."0123456789"];
const browserEndpoint = await getBrowserEndpoint();
if (browserEndpoint.isErr()) {
  logger.error("Failed to get browser endpoint");
  process.exit(1);
}

const browser = await getBrowser(browserEndpoint.value);
const page = await browser.newPage();

logger.info("Going to subjects page...");
await page.goto(COURSE_REGISTRY_URL, { waitUntil: "networkidle0" });
const SUBJECT_LIST_SELECTOR = "CLASS_SRCH_WRK2_SSR_PB_SUBJ_SRCH$";
const subjectListSelector = getIdSelector(SUBJECT_LIST_SELECTOR, 0);

await page.click(subjectListSelector);
await page.waitForNetworkIdle({ concurrency: 0 });

for (const character of characters) {
  logger.info(`Searching for subjects starting with ${character}`);
  const ALPHA_NUM_SELECTOR = "SSR_CLSRCH_WRK2_SSR_ALPHANUM_";
  const alphaNumSelector = `[id='${ALPHA_NUM_SELECTOR}${character}']`;

  await page.click(alphaNumSelector);
  await page.waitForNetworkIdle({ concurrency: 0 });

  const html = await page.content();
  const $ = cheerio.load(html);

  const SUBJECT_SELECTOR = "win0divSSR_CLSRCH_SUBJ_SUBJECT$";
  const subjectSelector = getIdStartsWithSelector(SUBJECT_SELECTOR);
  const subjects: Omit<Subject, "isDeleted">[] = $(subjectSelector)
    .text()
    .split("\n")
    .filter(subject => subject !== null && subject !== "")
    .map(subject => {
      return { subject };
    });

  if (subjects.length === 0) {
    logger.error("No subjects found.\n");
    continue;
  }

  await updateAvailableSubjects(subjects);
  logger.silent("");
}

await page.close();
await browser.disconnect();
process.exit(0);
