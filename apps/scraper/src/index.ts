import logHeader from './utils/logHeader';
import getAvailableTerms from './utils/getAvailableTerms';
import searchAndScrapeCourses from './searchAndScrapeCourses';

async function main() {
  logHeader('Pre-Scrape');
  const terms = await getAvailableTerms();
  const term = 0;

  const courses = JSON.parse(process.argv[2]);

  logHeader(`Scraping for courses in ${terms[0].term}`, true);
  await searchAndScrapeCourses(courses, terms[term]);
}

main();
