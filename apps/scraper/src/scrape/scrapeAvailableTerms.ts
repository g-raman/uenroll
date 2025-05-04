import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../utils/constants.ts";
import type { Term } from "../utils/types.ts";
import { db, updateAvailableTerms } from "../supabase.ts";
import { fetchCookie } from "../utils/cookies.ts";

const response = await fetchCookie(COURSE_REGISTRY_URL);
const html = await response.text();
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

await updateAvailableTerms(terms);
await db.$client.end();
