import * as cheerio from "cheerio";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type {
  CourseDetailsInsert,
  Term,
  TermInsert,
  SubjectInsert,
} from "@repo/db/types";
import {
  getCourseCodeAndCourseTitle,
  getDates,
  getIdSelector,
  getIdStartsWithSelector,
  getInstructors,
  getSectionAndType,
  getStatus,
  getTimings,
  getTotalSections,
  processSessions,
  getError,
} from "../utils/scrape.js";

const COURSE_REGISTRY_URL =
  "https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL";
const COURSE_CATALOGUE_URL = "https://catalogue.uottawa.ca/en/courses/";

const MAX_RETRIES_FOR_ICSID = 5;
const FIRST_YEAR = 1;
const LAST_YEAR = 6;

const COURSE_CONTAINER_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2$";
const COURSE_TITLE_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2GP$";
const SECTION_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX3$";

/**
 * Cookie store for maintaining session state across requests.
 * In Workers, we can't use fetch-cookie, so we manage cookies manually.
 */
class CookieStore {
  private cookies: Map<string, string> = new Map();

  /**
   * Extract cookies from a response and store them
   */
  extractFromResponse(response: Response): void {
    // Use getSetCookie if available (modern browsers/runtimes), otherwise fall back to get
    const setCookieHeaders =
      (
        response.headers as unknown as { getSetCookie?: () => string[] }
      ).getSetCookie?.() ||
      response.headers.get("set-cookie")?.split(/,(?=\s*\w+=)/) ||
      [];

    for (const cookieHeader of setCookieHeaders) {
      const [cookiePart] = cookieHeader.split(";");
      if (cookiePart) {
        const [name, value] = cookiePart.split("=");
        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      }
    }
  }

  /**
   * Get the Cookie header value for requests
   */
  getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /**
   * Clear all cookies
   */
  clear(): void {
    this.cookies.clear();
  }
}

/**
 * Get ICSID token from the course registry page.
 * This token is required for making search requests.
 */
async function getICSID(
  cookieStore: CookieStore,
): Promise<Result<string, Error>> {
  const initialResponse = await ResultAsync.fromPromise(
    fetch(COURSE_REGISTRY_URL, {
      method: "GET",
      headers: {
        Cookie: cookieStore.getCookieHeader(),
      },
    }),
    error => new Error(`Failed to fetch course registry HTML: ${error}`),
  );

  if (initialResponse.isErr()) {
    return err(initialResponse.error);
  }

  // Extract cookies from response
  cookieStore.extractFromResponse(initialResponse.value);

  const initialHtml = await ResultAsync.fromPromise(
    initialResponse.value.text(),
    error => new Error(`Failed to parse HTML response: ${error}`),
  );

  if (initialHtml.isErr()) {
    return err(initialHtml.error);
  }

  const icsid = Result.fromThrowable(
    () => {
      const $ = cheerio.load(initialHtml.value);
      return $("input[name=ICSID]").attr("value");
    },
    error => new Error(`Failed to get ICSID: ${error}`),
  )();

  if (icsid.isErr()) {
    return err(icsid.error);
  }

  if (!icsid.value) {
    return err(new Error("ICSID not found in HTML"));
  }

  return ok(icsid.value);
}

/**
 * Scrape available terms from the course registry
 */
export async function scrapeAvailableTerms(): Promise<
  Result<TermInsert[], Error>
> {
  const response = await ResultAsync.fromPromise(
    fetch(COURSE_REGISTRY_URL),
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

/**
 * Scrape available subjects from the course catalogue
 */
export async function scrapeAvailableSubjects(): Promise<
  Result<SubjectInsert[], Error>
> {
  const response = await ResultAsync.fromPromise(
    fetch(COURSE_CATALOGUE_URL),
    error => new Error(`Failed to fetch course catalogue: ${error}`),
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
  const SUBJECT_CODE_REGEX = /\(([^()]*)\)(?!.*\([^()]*\))/;
  const subjectCodeRegex = new RegExp(SUBJECT_CODE_REGEX);

  const subjects: SubjectInsert[] = [];

  $(".letternav-head + ul > li").each(function () {
    const subject = $(this).text();
    const isMatch = subjectCodeRegex.test(subject);
    if (!isMatch) {
      console.log(`Couldn't find a match for ${subject}`);
      return;
    }

    const subjectCode = subjectCodeRegex.exec(subject);
    if (!subjectCode || !subjectCode[1]) {
      console.log(
        `Something went wrong trying to match for subject: ${subject}`,
      );
      return;
    }

    subjects.push({ subject: subjectCode[1] });
  });

  // Manual entries for courses that aren't listed in the catalogue
  const manualSubjects = [
    "PBH",
    "ADX",
    "CTM",
    "DTO",
    "EHA",
    "EMC",
    "ESG",
    "MEM",
    "MIA",
    "POP",
    "PHM",
  ];
  for (const subject of manualSubjects) {
    subjects.push({ subject });
  }

  return ok(subjects);
}

/**
 * Get search results for a specific subject and year
 */
export async function getSubjectByYear(
  term: Omit<Term, "isDeleted">,
  year: number,
  subject: string,
  english: boolean = true,
  french: boolean = true,
): Promise<Result<string, Error>> {
  const cookieStore = new CookieStore();

  // Get ICSID token with retry logic
  let icsid: string | undefined;
  let counter = 1;

  while (!icsid) {
    if (counter > MAX_RETRIES_FOR_ICSID) {
      return err(new Error("Failed to get ICSID after max retries"));
    }

    const icsidResult = await getICSID(cookieStore);
    if (icsidResult.isOk()) {
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

  const body = new URLSearchParams(params);

  const response = await ResultAsync.fromPromise(
    fetch(COURSE_REGISTRY_URL, {
      method: "POST",
      body,
      headers: {
        Cookie: cookieStore.getCookieHeader(),
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
 * Parse search results HTML into course details
 */
export function scrapeSearchResults(
  $: cheerio.CheerioAPI,
  term: Omit<Term, "isDeleted">,
): CourseDetailsInsert {
  const totalSections = getTotalSections($);
  let sectionNumber = 0;

  const details: CourseDetailsInsert = {
    courses: [],
    courseComponents: [],
    sessions: [],
  };

  const allCourseContainersSelector = getIdStartsWithSelector(
    COURSE_CONTAINER_SELECTOR,
  );
  const allCourses = $(allCourseContainersSelector);

  const allCourseTitleSelector = getIdStartsWithSelector(COURSE_TITLE_SELECTOR);
  const courses = allCourses.find(allCourseTitleSelector);

  courses.each(function (this, courseNumber) {
    const courseContainerSelector = getIdSelector(
      COURSE_CONTAINER_SELECTOR,
      courseNumber,
    );
    const courseContainer = $(courseContainerSelector);
    const parsedCourseHeader = getCourseCodeAndCourseTitle($(this));

    if (parsedCourseHeader.isErr()) {
      console.error(parsedCourseHeader.error);
      return false;
    }

    const [courseCode, courseTitle] = parsedCourseHeader.value;

    const sectionSelector = getIdStartsWithSelector(SECTION_SELECTOR);
    const sectionDetails = courseContainer.find(sectionSelector);

    let currentSection = "";

    sectionDetails.each(function (this) {
      const section = $(this);
      const parsedSubsectionDetails = getSectionAndType(section, sectionNumber);

      if (parsedSubsectionDetails.isErr()) {
        console.error(parsedSubsectionDetails.error);
        return false;
      }

      const [subSection, type] = parsedSubsectionDetails.value;

      const instructors = getInstructors(section, sectionNumber);
      if (instructors.isErr()) {
        console.error(instructors.error);
        return false;
      }

      const dates = getDates(section, sectionNumber);
      if (dates.isErr()) {
        console.error(dates.error);
        return false;
      }

      const timings = getTimings(section, sectionNumber);
      if (timings.isErr()) {
        console.error(timings.error);
        return false;
      }

      const status = getStatus(section, sectionNumber);
      if (status.isErr()) {
        console.error(status.error);
        return false;
      }

      const newSectionRegex = /^[A-Z][A-Z]?[1-9]?00$/;
      const isNewSection = newSectionRegex.test(subSection);
      currentSection = isNewSection ? subSection : currentSection;

      const sessions = processSessions(
        term.value,
        courseCode,
        subSection,
        currentSection,
        instructors.value,
        dates.value,
        timings.value,
      );

      details.sessions.push(...sessions);

      details.courseComponents.push({
        term: term.value,
        courseCode,
        section: currentSection,
        subSection,
        type,
        isOpen: status.value,
        isDeleted: false,
      });

      sectionNumber++;

      if (sectionNumber >= totalSections) {
        return false;
      }
    });

    details.courses.push({
      courseCode,
      courseTitle,
      term: term.value,
      isDeleted: false,
    });
  });

  return details;
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
): Promise<Result<CourseDetailsInsert, Error>> {
  const html = await getSubjectByYear(term, year, subject, english, french);

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

// Export constants for use in workflows
export { FIRST_YEAR, LAST_YEAR };
