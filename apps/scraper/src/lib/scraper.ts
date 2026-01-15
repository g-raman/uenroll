import * as cheerio from "cheerio";
import { err, ok, Result, ResultAsync } from "neverthrow";
import type { CourseDetailsInsert, Term } from "@repo/db/types";
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
import {
  createFetchWithCookies,
  getICSID,
  COURSE_REGISTRY_URL,
} from "./cookies.js";

const MAX_RETRIES_FOR_ICSID = 5;
const FIRST_YEAR = 1;
const LAST_YEAR = 6;

const COURSE_CONTAINER_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2$";
const COURSE_TITLE_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2GP$";
const SECTION_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX3$";

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
