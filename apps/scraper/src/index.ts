/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import logHeader from './utils/logHeader.ts';
import getAvailableTerms from './utils/getAvailableTerms.ts';
import searchAndScrapeCourses from './searchAndScrapeCourses.ts';

async function main() {
  logHeader('Pre-Scrape');
  const terms = await getAvailableTerms();
  const term = 1;

  const courses = JSON.parse(Deno.args[0]);

  logHeader(`Scraping for courses in ${terms[term].term}`, true);
  console.log(terms);
  return;

  const res = await fetch('http://localhost:9222/json/version');
  const data = await res.json();
  const browserEndpoint = data.webSocketDebuggerUrl;

  await searchAndScrapeCourses(courses, terms[term], browserEndpoint);
}

main();
