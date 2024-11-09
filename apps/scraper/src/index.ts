/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import logHeader from './utils/logHeader.ts';
import getAvailableTerms from './utils/getAvailableTerms.ts';
import searchAndScrapeCourses from './searchAndScrapeCourses.ts';
import { getBrowserEndpoint } from './utils/browser.ts';

async function main() {
  logHeader('Pre-Scrape');
  const terms = await getAvailableTerms();
  const term = 0;

  const courses = Deno.args;

  logHeader(`Scraping for courses in ${terms[term].term}`, true);

  const browserEndpoint = await getBrowserEndpoint();

  await searchAndScrapeCourses(courses, terms[term], browserEndpoint);
}

main();
