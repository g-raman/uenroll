import puppeteer, { Browser, Page } from 'puppeteer';
import { NUM_YEARS, PUPPETEER_ARGS, URL } from './utils/constants';
import setSearchOptions from './setSearchOptions';
import scrapeSearchResults from './scrapeSearchResults';
import logHeader from './utils/logHeader';
import getAvailableCourses from './utils/getAvailableCourses';
import getAvailableTerms from './utils/getAvailableTerms';
import { deleteAllMarkedAsDeleted, markAllAsDeleted, upsertCourseDetails } from './supabase';

async function main() {
  logHeader('Pre-Scrape');
  const terms = await getAvailableTerms();
  const courses = await getAvailableCourses();

  logHeader('Scraping', true);
  console.log('Launching puppeteer...');
  const browser: Browser = await puppeteer.launch({ args: PUPPETEER_ARGS });
  const page: Page = await browser.newPage();
  console.log('Puppeteer started');

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });

  const start = performance.now();
  const term = 0;
  await page.goto(URL, { waitUntil: 'networkidle2' });

  await markAllAsDeleted(terms[term].term);

  logHeader(`Scraping for courses in ${terms[0].term}`, true);
  for (let j = 0; j < courses.length; j++) {
    console.log(`Attempting search for ${courses[j]}`);
    for (let k = 1; k <= NUM_YEARS; k++) {
      await setSearchOptions(page, courses[j], k, terms[term]);

      const message = await page.$('.SSSMSGALERTTEXT');
      if (message) {
        const error = await message.evaluate((elem) => {
          const text = elem.textContent;
          elem.remove();
          return text;
        });
        console.log(`Year: ${k} (${error})`);
        console.log();
        continue;
      } else {
        console.log(`Year: ${k} (Classes found)`);
      }

      const results = await scrapeSearchResults(page, terms[term].term);
      await upsertCourseDetails(results);

      console.log();
    }
  }

  await deleteAllMarkedAsDeleted();

  page.close();
  browser.close();
  const end = performance.now();
  console.log(`Time: ${end - start}`);
}

main();
