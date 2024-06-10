import puppeteer, { Browser, Page } from 'puppeteer';
import { NUM_YEARS, PUPPETEER_ARGS, URL } from './constants';
import supabase from './supabase';
import { term } from './types';
import setSearchOptions from './setSearchOptions';
import scrapeSearchResults from './scrapeSearchResults';
import pLimit from 'p-limit';

async function main() {
  console.log('------------------------------');
  console.log('Pre-Scrape');
  console.log('------------------------------');

  console.log('Fetching available terms...');
  const termsResult = await supabase.from('availableTerms').select('term,value').order('term', { ascending: true });
  if (termsResult.error) {
    console.error('Error: Something went wrong when fetching list of available terms');
    console.log(termsResult.error);
    console.log();
  }
  const terms = termsResult.data as term[];
  console.log('Available terms fetched\n');

  console.log('Fetching available courses...');
  const coursesResult = await supabase.from('availableCourses').select('subject').order('subject', { ascending: true });
  if (coursesResult.error) {
    console.error('Error: Something went wrong when fetching list of available courses');
    console.log(coursesResult.error);
    console.log();
  }
  const courses = coursesResult?.data?.map((course) => course.subject) as string[];
  console.log('Available courses fetched\n');

  console.log('');
  console.log('------------------------------');
  console.log('Scraping');
  console.log('------------------------------');

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
  const limit = pLimit(1);
  await page.goto(URL, { waitUntil: 'networkidle2' });
  for (let i = 0; i < 1; i++) {
    console.log('\n');
    console.log('------------------------------');
    console.log(`Scraping for courses in ${terms[i].term}`);
    console.log('------------------------------');
    for (let j = 0; j < 10; j++) {
      console.log(`Attempting search for ${courses[j]}`);
      for (let k = 1; k <= NUM_YEARS; k++) {
        console.log(`Year: ${k}`);
        const searchOptionsResult = await setSearchOptions(page, courses[j], k, terms[i]);
        if (searchOptionsResult) {
          console.log(searchOptionsResult);
        }

        await page.waitForNetworkIdle({ concurrency: 1 });
        const message = await page.$('.SSSMSGALERTTEXT');

        if (message) {
          console.log((await message.evaluate((messageElem) => messageElem.innerText)) + '\n');
          continue;
        }

        try {
          const input = [
            limit(() => scrapeSearchResults(page, terms[i].term)),
            limit(() => page.click('#CLASS_SRCH_WRK2_SSR_PB_MODIFY')),
            limit(() => page.waitForNetworkIdle({ concurrency: 1 })),
          ];
          await Promise.all(input);
        } catch (error) {
          console.log('Couldnt find modify button');
        }
        console.log();
      }
    }
  }

  page.close();
  browser.close();
  const end = performance.now();
  console.log(`Time: ${end - start}`);
}

main();
