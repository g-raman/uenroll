import puppeteer, { Browser, Page } from 'puppeteer';
import { term } from './utils/types';
import setSearchOptions from './setSearchOptions';
import scrapeSearchResults from './scrapeSearchResults';
import { upsertCourseDetails } from './supabase';
import { NUM_YEARS, PUPPETEER_ARGS, URL } from './utils/constants';

async function searchAndScrapeCourses(courses: string[], term: term) {
  console.log('Launching puppeteer...');
  const browser: Browser = await puppeteer.launch({ args: PUPPETEER_ARGS });
  console.log('Puppeteer started');

  const page: Page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });

  for (let j = 0; j < courses.length; j++) {
    console.log(`Attempting search for ${courses[j]}`);
    for (let k = 1; k <= NUM_YEARS; k++) {
      await setSearchOptions(page, courses[j], k, term);

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

      const results = await scrapeSearchResults(page, term.term);
      await upsertCourseDetails(results);

      console.log();
    }
  }
  await page.close();
  await browser.close();
}

export default searchAndScrapeCourses;
