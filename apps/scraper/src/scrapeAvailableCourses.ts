import puppeteer, { Browser, Page, Protocol } from 'npm:puppeteer';
import { URL } from './utils/constants.ts';
import supabase from './supabase.ts';
import { subject } from './utils/types.ts';

async function updateAvailableCourses(availableCourses: subject[]): Promise<void> {
  console.log('Inserting new available courses...');
  const { error } = await supabase
    .from('availableCourses')
    .upsert(availableCourses, { onConflict: 'subject' })
    .select();

  if (error) {
    console.error('Error: Something went wrong when inserting new available courses data');
    console.log(error);
    return;
  }
  console.log('Successfully inserted new available courses');
}

function extractCourseStartingLetter(selector: string): string {
  const regex = /(.)(?=\.PSPAGE)/;
  const match = selector.match(regex);

  let currChar: string;
  if (match) {
    currChar = match[1];
  } else {
    currChar = 'Unknown';
  }
  return currChar;
}

async function main() {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.click('.SSSBUTTON_ACTIONLINK');
  await page.waitForNetworkIdle({ concurrency: 2 });
  const alphaNumLinkArr = await page.$$('a.PSPAGE');

  const listOfSubjects: subject[] = [];
  for (let i = 0; i < alphaNumLinkArr.length; i++) {
    const currObj = (await alphaNumLinkArr[i].remoteObject()) as Protocol.Runtime.RemoteObject;
    const currSelector = currObj.description as string;
    const currChar = extractCourseStartingLetter(currSelector);
    console.log(`Searching for subjects starting with ${currChar}`);

    const currElem = await page.$(currSelector);
    await currElem?.click();
    await page.waitForNetworkIdle({ concurrency: 2 });

    const error = await page.$('.PSTEXT');
    if (error) {
      console.log('No courses found\n');
      continue;
    }
    console.log('Courses found');

    const result = await page.evaluate(() => {
      const results: subject[] = [];

      const courseCodeElements = document.querySelectorAll('span.PSEDITBOX_DISPONLY');

      for (let j = 0; j < courseCodeElements.length; j++) {
        const currElem = courseCodeElements[j].innerHTML;
        if (currElem !== currElem.toUpperCase() || currElem.length > 4) {
          continue;
        }
        results.push({ subject: courseCodeElements[j].innerHTML });
      }
      return results;
    });

    if (!result) {
      console.error(`Error: Something went wrong when scraping courses starting with ${currChar}\n`);
    }
    console.log(`Succesfully scraped courses starting with ${currChar}\n`);

    listOfSubjects.push(...result);
  }

  await page.close();
  await browser.close();

  updateAvailableCourses(listOfSubjects);
}

main();
