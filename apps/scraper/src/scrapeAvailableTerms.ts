import { URL } from './utils/constants.ts';
import supabase from './supabase.ts';
import { term } from './utils/types.ts';
import { getBrowserEndpoint, withBrowser, withPage } from './utils/browser.ts';

async function updateAvailableTerms(availableTerms: term[]): Promise<void> {
  console.log('Inserting new available terms...');

  const { error } = await supabase.from('availableTerms').upsert(availableTerms, { onConflict: 'term' }).select();
  if (error) {
    console.error('Error: Something went wrong when inserting new available terms data');
    console.log(error);
    return;
  }
  console.log('Successfully inserted new available terms');
}

async function main() {
  const browserEndpoint = await getBrowserEndpoint();

  withBrowser(browserEndpoint, async (browser) => {
    await withPage(browser)(async (page) => {
      await page.goto(URL, { waitUntil: 'networkidle2' });

      console.log('Scraping available terms...');

      const availableTerms: term[] = await page.evaluate(() => {
        const terms: HTMLSelectElement = document.getElementById('CLASS_SRCH_WRK2_STRM$35$') as HTMLSelectElement;

        return Array.from(terms.options)
          .filter((term) => term.value !== '')
          .map((term) => {
            const res = {
              value: term.value,
              term: term.innerHTML,
            };
            return res;
          });
      });

      if (!availableTerms) {
        console.error('Error: Something went wrong when scraping the available terms');
        return;
      }
      console.log('Successfully scraped available terms');

      updateAvailableTerms(availableTerms);
    });
  });
}

main();
