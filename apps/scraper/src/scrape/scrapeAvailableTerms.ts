import * as cheerio from "cheerio/slim";
import { getBrowserEndpoint, getBrowser } from "../utils/browser.ts";
import { COURSE_REGISTRY_URL } from "../utils/constants.ts";
import { Term } from "../utils/types.ts";
import { updateAvailableTerms } from "../supabase.ts";

const browserEndpoint = await getBrowserEndpoint();

const browser = await getBrowser(browserEndpoint);
const page = await browser.newPage();

await page.goto(COURSE_REGISTRY_URL, { waitUntil: "networkidle0" });
const html = await page.content();
const $ = cheerio.load(html);

const terms: Term[] = [];
$("[id='CLASS_SRCH_WRK2_STRM$35$']")
  .find("option")
  .each(function () {
    const option = $(this);

    if (option.attr("value") === "") {
      return;
    }
    const term = option.text();
    const value = option.attr("value") as string;

    terms.push({
      term,
      value,
    });
  });

await page.close();
await browser.disconnect();

await updateAvailableTerms(terms);
