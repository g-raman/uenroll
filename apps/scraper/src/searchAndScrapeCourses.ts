import { term } from './utils/types.ts';
import setSearchOptions from './setSearchOptions.ts';
import scrapeSearchResults from './scrapeSearchResults.ts';
import { upsertCourseDetails } from './supabase.ts';
import { NUM_YEARS, URL } from './utils/constants.ts';
import { withBrowser, withPage } from './utils/browser.ts';

async function searchAndScrapeCourses(courses: string[], term: term, browserEndpoint: string) {
  await withBrowser(browserEndpoint, async (browser) => {
    await withPage(browser)(async (page) => {
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
          await page.waitForNetworkIdle({ concurrency: 1 });

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
    });
  });
}

export default searchAndScrapeCourses;
