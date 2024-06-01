import { configDotenv } from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer';

configDotenv({ path: './config.env' });

const URL =
  'https://uocampus.public.uottawa.ca/' +
  'psc/csprpr9pub/EMPLOYEE/SA/c/' +
  'UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL?' +
  'languageCd=ENG&PortalActualURL=https%3a%2f%2f' +
  'uocampus.public.uottawa.ca%2fpsc%2fcsprpr9pub%2f' +
  'EMPLOYEE%2fSA%2fc%2fUO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL%3f' +
  'languageCd%3dENG&PortalContentURL=https%3a%2f%2f' +
  'uocampus.public.uottawa.ca%2fpsc%2fcsprpr9pub%2f' +
  'EMPLOYEE%2fSA%2fc%2fUO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL&' +
  'PortalContentProvider=SA&PortalCRefLabel=' +
  'Public%20Class%20Search&PortalRegistryName=EMPLOYEE&' +
  'PortalServletURI=https%3a%2f%2f' +
  'uocampus.public.uottawa.ca%2fpsp%2fcsprpr9pub%2f&' +
  'PortalURI=https%3a%2f%2fuocampus.public.uottawa.ca' +
  '%2fpsc%2fcsprpr9pub%2f&PortalHostNode=SA&' +
  'NoCrumbs=yes&PortalKeyStruct=yes';

async function main() {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
}

main();
