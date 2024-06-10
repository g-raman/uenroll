import puppeteer, { Browser, Page } from 'puppeteer';
import { NUM_YEARS, PUPPETEER_ARGS, URL } from './constants';
import supabase from './supabase';
import { term } from './types';
import setSearchOptions from './setSearchOptions';
import scrapeSearchResults from './scrapeSearchResults';

async function main() {
  const termsResult = await supabase.from('availableTerms').select('term,value').order('term', { ascending: true });
  if (termsResult.error) {
    console.error('Error: Something went wrong when fetching list of available terms');
    console.log(termsResult.error);
  }
  const terms = termsResult.data as term[];

  const coursesResult = await supabase.from('availableCourses').select('subject').order('subject', { ascending: true });
  if (coursesResult.error) {
    console.error('Error: Something went wrong when fetching list of available courses');
    console.log(coursesResult.error);
  }
  const courses = coursesResult?.data?.map((course) => course.subject) as string[];

  const browser: Browser = await puppeteer.launch({ args: PUPPETEER_ARGS });
  const page: Page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle2' });
  for (let i = 0; i < 1; i++) {
    for (let j = 0; j < 10; j++) {
      for (let k = 1; k <= NUM_YEARS; k++) {
        await setSearchOptions(page, courses[j], k, terms[i]);
        await page.waitForNetworkIdle({ concurrency: 1 });

        if (await page.$('.SSSMSGALERTTEXT')) {
          continue;
        } else {
          await scrapeSearchResults(page, terms[i].term);
          await page.click('#CLASS_SRCH_WRK2_SSR_PB_MODIFY');
          await page.waitForNetworkIdle({ concurrency: 1 });
        }
      }
    }
  }

  page.close();
  browser.close();
}

main();
