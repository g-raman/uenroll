import puppeteer, { Browser, Page } from 'puppeteer';
import { URL } from './constants';
import { createClient } from '@supabase/supabase-js';
import { configDotenv } from 'dotenv';

configDotenv({ path: 'src/config.env' });

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAvailableTerms(availableTerms): Promise<void> {
  const { status: softDeleteStatus } = await supabase
    .from('availableTerms')
    .update({ isDeleted: true })
    .eq('isDeleted', false);

  if (!softDeleteStatus) {
    console.error('Error: Something went wrong when soft deleting old available terms');
    return;
  }

  const { error } = await supabase.from('availableTerms').insert(availableTerms).select();
  if (error) {
    console.error('Error: Something went wrong when inserting new available terms data');
    return;
  }
  console.log('Successfully inserted new available terms');

  const { status: hardDeleteStatus } = await supabase.from('availableTerms').delete().eq('isDeleted', true);
  if (!hardDeleteStatus) {
    console.error('Error: Something went wrong when hard deleting old data');
    return;
  }
  console.log('Successfully hard deleted old available terms');
}

async function main() {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle2' });

  console.log('Scraping available terms...');
  const availableTerms = await page.evaluate(() => {
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
  await page.close();
  await browser.close();

  if (!availableTerms) {
    console.error('Error: Something went wrong when scraping the available terms');
    return;
  }
  console.log('Successfully scraped available terms');

  updateAvailableTerms(availableTerms);
}

main();
