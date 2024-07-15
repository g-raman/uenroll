import puppeteer, { Browser, Page } from 'puppeteer';

type BrowserFunction = (browser: Browser) => Promise<unknown>;
type PageFunction = (page: Page) => Promise<unknown>;

export const withBrowser = async (browserEndpoint: string, fn: BrowserFunction) => {
  const browser = await puppeteer.connect({ browserWSEndpoint: browserEndpoint });

  try {
    return await fn(browser);
  } finally {
    await browser.disconnect();
  }
};

export const withPage = (browser: Browser) => async (fn: PageFunction) => {
  const page = await browser.newPage();

  try {
    return await fn(page);
  } finally {
    await page.close();
  }
};
