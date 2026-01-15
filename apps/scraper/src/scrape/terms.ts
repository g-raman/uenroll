import type { TermInsert } from "@repo/db/types";
import { ok, err, ResultAsync, type Result } from "neverthrow";
import { createFetchWithCookies } from "../lib/cookies.js";
import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../lib/constants.js";

/*
 * Scrape available terms from the course registry
 */
export async function scrapeAvailableTerms(): Promise<
  Result<TermInsert[], Error>
> {
  const fetchWithCookies = createFetchWithCookies();

  const response = await ResultAsync.fromPromise(
    fetchWithCookies(COURSE_REGISTRY_URL),
    error => new Error(`Failed to fetch course registry: ${error}`),
  );

  if (response.isErr()) {
    return err(response.error);
  }

  const html = await ResultAsync.fromPromise(
    response.value.text(),
    error => new Error(`Failed to get HTML text: ${error}`),
  );

  if (html.isErr()) {
    return err(html.error);
  }

  const $ = cheerio.load(html.value);
  const terms: TermInsert[] = [];

  $("[id='CLASS_SRCH_WRK2_STRM$35$']")
    .find("option")
    .each(function (this) {
      const option = $(this);
      const value = option.attr("value");

      if (!value || value === "") {
        return;
      }

      const term = option.text();
      terms.push({ term, value });
    });

  if (terms.length === 0) {
    return err(new Error("No terms found"));
  }

  return ok(terms);
}
