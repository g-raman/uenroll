import puppeteer, { Browser, Page } from 'npm:puppeteer';

type BrowserFunction = (browser: Browser) => Promise<unknown>;
type PageFunction = (page: Page) => Promise<unknown>;

export const withBrowser = async (browserEndpoint: string, fn: BrowserFunction) => {
  const environment = Deno.env.get('ENVIRONMENT');

  let browser;
  if (environment === 'DEV') {
    browser = await puppeteer.launch({ headless: false });
  } else {
    browser = await puppeteer.connect({ browserWSEndpoint: browserEndpoint });
  }

  try {
    return await fn(browser);
  } finally {
    if (environment === 'DEV') {
      await browser.close();
    } else {
      await browser.disconnect();
    }
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
