import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../utils/constants.js";
import type { Term } from "../utils/types.js";
import { db, updateAvailableTerms } from "../supabase.js";
import { fetchCookie } from "../utils/cookies.js";

const response = await fetchCookie(COURSE_REGISTRY_URL);
const html = await response.text();
const $ = cheerio.load(html);

const terms: Term[] = [];
$("[id='CLASS_SRCH_WRK2_STRM$35$']")
  .find("option")
  .each(function (this) {
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
