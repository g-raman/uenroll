import logHeader from './utils/logHeader';
import getAvailableTerms from './utils/getAvailableTerms';
import searchAndScrapeCourses from './searchAndScrapeCourses';

async function main() {
  logHeader('Pre-Scrape');
  const terms = await getAvailableTerms();
  const term = 1;

  const courses = JSON.parse(process.argv[2]);

  logHeader(`Scraping for courses in ${terms[term].term}`, true);

  const res = await fetch('http://localhost:9222/json/version');
  const data = await res.json();
  const browserEndpoint = data.webSocketDebuggerUrl;

  await searchAndScrapeCourses(courses, terms[term], browserEndpoint);
}

main();
