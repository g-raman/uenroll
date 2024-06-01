import { configDotenv } from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer';
import { URL } from './constants';

configDotenv({ path: './config.env' });

async function main() {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
}

main();
