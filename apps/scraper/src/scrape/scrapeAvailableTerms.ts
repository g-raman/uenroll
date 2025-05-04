import cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../utils/constants";
import type { Term } from "../utils/types";
import { db, updateAvailableTerms } from "../supabase";
import { fetchCookie } from "../utils/cookies";

const response = await fetchCookie(COURSE_REGISTRY_URL);
const html = await response.text();
const $ = cheerio.load(html);

const terms: Term[] = [];
$("[id='CLASS_SRCH_WRK2_STRM$35$']")
  .find("option")
  .each(function (this: cheerio.Element) {
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

await updateAvailableTerms(terms);
await db.$client.end();
