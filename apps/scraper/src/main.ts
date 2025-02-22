import scrapeSearchResults from "./scrape/scrapeSearchResults.ts";
import searchForCourse from "./scrape/searchForCourse.ts";
import getAvailableTerms, {
  getAvailableCourses,
  upsertCourseDetails,
} from "./supabase.ts";
import { getBrowser, getBrowserEndpoint } from "./utils/browser.ts";
import {
  COURSE_REGISTRY_URL,
  FIRST_YEAR,
  LAST_YEAR,
} from "./utils/constants.ts";
import "jsr:@std/dotenv/load";
import * as cheerio from "cheerio";
import { getError } from "./utils/scrape.ts";

const terms = await getAvailableTerms();
const browserEndpoint = await getBrowserEndpoint();

const browser = await getBrowser(browserEndpoint);
const page = await browser.newPage();

const term = terms[0];
const courses = await getAvailableCourses();

for (const course of courses) {
  for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
    console.log(`Searching for ${course} year ${year} courses:`);
    await page.goto(COURSE_REGISTRY_URL, { waitUntil: "networkidle0" });
    await searchForCourse(page, term, course, year);
    await page.waitForNetworkIdle({ concurrency: 0 });

    const html = await page.content();
    const parser = cheerio.load(html);

    const error = getError(parser);
    if (error != null) {
      console.log(error + "\n");
      continue;
    }

    const results = scrapeSearchResults(parser, term);
    console.log("Results scraped.");
    await upsertCourseDetails(results);

    console.log(`Year ${year} processing complete.\n`);
  }
}

await page.close();
await browser.disconnect();
Deno.exit(0);
