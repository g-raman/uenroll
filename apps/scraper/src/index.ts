import puppeteer, { Browser, Page } from 'puppeteer';
import { URL } from './constants';
import supabase from './supabase';

async function main() {
  const coursesResult = await supabase.from('availableCourses').select('subject').order('subject', { ascending: true });
  if (coursesResult.error) {
    console.error('Error: Something went wrong when fetching list of available courses');
    console.log(coursesResult.error);
  }
  const courses = coursesResult?.data?.map((course) => course.subject);

  const terms = await supabase.from('availableTerms').select('term,value').order('term', { ascending: true });
  if (terms.error) {
    console.error('Error: Something went wrong when fetching list of available terms');
    console.log(terms.error);
  }

  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
}

main();
