import * as cheerio from "cheerio";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type { CourseDetailsInsert, Term } from "@repo/db/types";
import { createFetchWithCookies, getICSID } from "./cookies.js";
import { scrapeSearchResults } from "../scrape/courses.js";
import { getError } from "../scrape/utils.js";
import { COURSE_REGISTRY_URL } from "./constants.js";

const MAX_RETRIES_FOR_ICSID = 8;

/**
 * Get search results for a specific subject and year
 */
export async function getSubjectByYear(
  term: Omit<Term, "isDeleted">,
  year: number,
  subject: string,
  english: boolean = true,
  french: boolean = true,
  component = "",
  exactCourse: number | null = null,
): Promise<Result<string, Error>> {
  // Create a cookie-aware fetch that maintains session across requests
  const fetchWithCookies = createFetchWithCookies();

  // Get ICSID token with retry logic
  let icsid: string | undefined;
  let counter = 1;

  while (!icsid) {
    if (counter > MAX_RETRIES_FOR_ICSID) {
      return err(new Error("Failed to get ICSID after max retries"));
    }

    const icsidResult = await getICSID(fetchWithCookies);
    if (icsidResult.isOk() && icsidResult.value) {
      icsid = icsidResult.value;
    }

    console.log(`ICSID attempt ${counter}`);
    counter++;
  }

  const params: Record<string, string> = {
    ICAJAX: "1",
    ICNAVTYPEDROPDOWN: "0",
    ICType: "Panel",
    ICElementNum: "0",
    ICStateNum: "1",
    ICAction: "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH",
    ICSID: icsid,
    UO_PUB_SRCH_WRK_UO_LNG_EN$chk$0: english ? "Y" : "N",
    UO_PUB_SRCH_WRK_UO_LNG_FR$chk$0: french ? "Y" : "N",
    UO_PUB_SRCH_WRK_UO_LNG_OT$chk$0: "Y",
    UO_PUB_SRCH_WRK_UO_LNG_BI$chk$0: "Y",
    CLASS_SRCH_WRK2_STRM$35$: term.value,
    SSR_CLSRCH_WRK_SUBJECT$0: subject.toUpperCase(),
    SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$0: "G",
    SSR_CLSRCH_WRK_CATALOG_NBR$0: "0",
    SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$0: "N",
    UO_PUB_SRCH_WRK_SSR_RPTCK_OPT_01$chk$0: year === 1 ? "Y" : "N",
    UO_PUB_SRCH_WRK_SSR_RPTCK_OPT_02$chk$0: year === 2 ? "Y" : "N",
    UO_PUB_SRCH_WRK_SSR_RPTCK_OPT_03$chk$0: year === 3 ? "Y" : "N",
    UO_PUB_SRCH_WRK_SSR_RPTCK_OPT_04$chk$0: year === 4 ? "Y" : "N",
    UO_PUB_SRCH_WRK_GRADUATED_TBL_CD$chk$0: year === 5 ? "Y" : "N",
  };

  if (component !== "") {
    params["SSR_CLSRCH_WRK_SSR_COMPONENT$0"] = component;
  }

  if (exactCourse !== null) {
    delete params["SSR_CLSRCH_WRK_SSR_COMPONENT$0"];
    params["SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$0"] = "E";
    params["SSR_CLSRCH_WRK_CATALOG_NBR$0"] = exactCourse.toString();
  }

  const body = new URLSearchParams(params);

  // Use the same cookie-aware fetch for the POST request
  const response = await ResultAsync.fromPromise(
    fetchWithCookies(COURSE_REGISTRY_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),
    error =>
      new Error(
        `Failed to get search results for ${subject} in ${term.term}: ${error}`,
      ),
  );

  if (response.isErr()) {
    return err(response.error);
  }

  return await ResultAsync.fromPromise(
    response.value.text(),
    error => new Error(`Failed to get HTML text: ${error}`),
  );
}

/**
 * Handle scraping with automatic language split when results exceed 300
 */
export async function handleScraping(
  term: Term,
  year: number,
  subject: string,
  english = true,
  french = true,
  component = "",
  exactCourse: number | null = null,
): Promise<Result<CourseDetailsInsert, Error>> {
  const html = await getSubjectByYear(
    term,
    year,
    subject,
    english,
    french,
    component,
    exactCourse,
  );

  if (html.isErr()) {
    return err(html.error);
  }

  if (html.value.length === 0) {
    return err(new Error("HTML didn't load"));
  }

  const parser = cheerio.load(html.value);
  const error = getError(parser);

  if (error != null) {
    return err(new Error(error));
  }

  const results = scrapeSearchResults(parser, term);

  if (
    results.courses.length === 0 ||
    results.courseComponents.length === 0 ||
    results.sessions.length === 0
  ) {
    return err(new Error("No search results found."));
  }

  return ok(results);
}
