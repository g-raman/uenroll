import * as cheerio from "cheerio";
import { getBrowser, getBrowserEndpoint } from "../utils/browser.js";
import { COURSE_REGISTRY_URL } from "../utils/constants.js";
import { getIdSelector, getIdStartsWithSelector } from "../utils/scrape.js";
import { updateAvailableSubjects } from "../supabase.js";
import type { Subject } from "../utils/types.js";
import { client } from "@repo/db";

const characters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."0123456789"];
const browserEndpoint = await getBrowserEndpoint();

const browser = await getBrowser(browserEndpoint);
const page = await browser.newPage();

console.log("Going to subjects page...");
await page.goto(COURSE_REGISTRY_URL, { waitUntil: "networkidle0" });
const SUBJECT_LIST_SELECTOR = "CLASS_SRCH_WRK2_SSR_PB_SUBJ_SRCH$";
const subjectListSelector = getIdSelector(SUBJECT_LIST_SELECTOR, 0);

await page.click(subjectListSelector);
await page.waitForNetworkIdle({ concurrency: 0 });

for (const character of characters) {
  console.log(`Searching for subjects starting with ${character}`);
  const ALPHA_NUM_SELECTOR = "SSR_CLSRCH_WRK2_SSR_ALPHANUM_";
  const alphaNumSelector = `[id='${ALPHA_NUM_SELECTOR}${character}']`;

  await page.click(alphaNumSelector);
  await page.waitForNetworkIdle({ concurrency: 0 });

  const html = await page.content();
  const $ = cheerio.load(html);

  const SUBJECT_SELECTOR = "win0divSSR_CLSRCH_SUBJ_SUBJECT$";
  const subjectSelector = getIdStartsWithSelector(SUBJECT_SELECTOR);
  const subjects: Subject[] = $(subjectSelector)
    .text()
    .split("\n")
    .filter(subject => subject !== null && subject !== "")
    .map(subject => {
      return { subject };
    });

  if (subjects.length === 0) {
    console.log("No subjects found.\n");
    continue;
  }

  await updateAvailableSubjects(subjects);
  console.log("");
}

await page.close();
await browser.disconnect();
await client.end();
