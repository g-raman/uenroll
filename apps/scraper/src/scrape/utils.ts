import type { SessionInsert } from "@repo/db/types";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { err, ok, Result } from "neverthrow";

/*
 * Selects the error message.
 * Two possible messages
 * 1. No classes found
 * 2. Your search will exceed the maximum limit of 300 sections. Specify additional criteria to continue.
 */
export const getError = ($: cheerio.CheerioAPI) => {
  const ERROR_SELECTOR = "[id='DERIVED_CLSMSG_ERROR_TEXT']";

  const error = $(ERROR_SELECTOR).text();
  if (error.includes("exceed")) {
    return "Search results exceed 300 items.";
  } else if (error.includes("No classes found")) {
    return "No classes found.";
  }
  return null;
};

export const getElementChildText = (
  element: cheerio.Cheerio<AnyNode>,
  selector: string,
) => {
  return element.find(selector).contents().toString().split("<br>");
};

/*
 * Returns a CSS selector string like
 * [id='win0divSSR_CLSRSLT_WRK_GROUPBOX3$2']
 */
export const getIdSelector = (id: string, count: number) => {
  return `[id='${id}${count}']`;
};

/*
 * Returns a CSS selector string like
 * [id^='win0divSSR_CLSRSLT_WRK_GROUPBOX3$2']
 */
export const getIdStartsWithSelector = (id: string) => {
  return `[id^='${id}']`;
};

/*
 * Gets an individual detail from a section element
 * Sub section, type, instructors, etc...
 */
export const getSectionDetail = (
  section: cheerio.Cheerio<AnyNode>,
  selector: string,
  count: number,
) => {
  const subSectionSelector = getIdSelector(selector, count);
  return getElementChildText(section, subSectionSelector);
};

/*
 * Gets total number of search results
 */
export const getTotalSections = ($: cheerio.CheerioAPI) => {
  const TOTAL_SEARCH_RESULTS_FOUND_LABEL_SELECTOR = ".PSGROUPBOXLABEL";
  const totalResultsLabel = $(TOTAL_SEARCH_RESULTS_FOUND_LABEL_SELECTOR).text();
  return parseInt(totalResultsLabel);
};

/*
 * Original Structure:
 * ADM 1100 - Introduction to Business (+1 combined)
 *
 * Easy split and we want no extra spaces
 * And none between course subject and number
 */
export const getCourseCodeAndCourseTitle = (
  course: cheerio.Cheerio<AnyNode>,
): Result<[string, string], Error> => {
  const courseHeader = course.text().trim();
  const [courseCodeString, courseTitle] = courseHeader.split(" - ");

  if (!courseCodeString) {
    return err(new Error(`Failed to parse course code for ${courseHeader}`));
  }
  if (!courseTitle) {
    return err(new Error(`Failed to parse course title for ${courseHeader}`));
  }

  const courseCode = courseCodeString.replaceAll(" ", "");

  return ok([courseCode, courseTitle]);
};

/*
 * Original Structure:
 * M00-LEC<br>FullSess.
 *
 * We discard the last part as that's unnecessary
 * We return the sub section and the component type
 */
export const getSectionAndType = (
  section: cheerio.Cheerio<AnyNode>,
  count: number,
): Result<[string, string], Error> => {
  const SUB_SECTION_SELECTOR = "MTG_CLASSNAME$";

  const subSectionDetails = getSectionDetail(
    section,
    SUB_SECTION_SELECTOR,
    count,
  )[0];

  if (!subSectionDetails) {
    return err(new Error(`Failed to get sub section details`));
  }

  const processedSubsectionDetails = subSectionDetails.split("-");
  if (!processedSubsectionDetails[0] || !processedSubsectionDetails[1]) {
    return err(new Error(`Failed to process subsection details`));
  }

  const [subSection, type] = processedSubsectionDetails;
  return ok([subSection, type]);
};

/*
 * Original Structure:
 * Alan O'Sullivan<br>Alan O'Sullivan
 *
 * Easy split. Returns an array
 */
export const getInstructors = (
  section: cheerio.Cheerio<AnyNode>,
  count: number,
): Result<string[], Error> => {
  const INSTRUCTOR_SELECTOR = "MTG_INSTR$";
  const details = getSectionDetail(section, INSTRUCTOR_SELECTOR, count);
  if (details.length === 0) {
    return err(new Error(`Failed to get instructors`));
  }
  return ok(details);
};

/*
 * Original Structure:
 * 2025-01-06 - 2025-04-05<br>2025-01-06 - 2025-04-05
 *
 * Easy split. Returns an array
 */
export const getDates = (
  section: cheerio.Cheerio<AnyNode>,
  count: number,
): Result<string[], Error> => {
  const DATES_SELECTOR = "MTG_TOPIC$";
  const details = getSectionDetail(section, DATES_SELECTOR, count);
  if (details.length === 0) {
    return err(new Error(`Failed to get dates`));
  }
  return ok(details);
};

/*
 * Original Structure:
 *
 * Tu 16:00 - 17:20<br>Th 14:30 - 15:50
 *
 * Easy split. Returns an array
 */
export const getTimings = (
  section: cheerio.Cheerio<AnyNode>,
  count: number,
): Result<string[], Error> => {
  const TIMINGS_SELECTOR = "MTG_DAYTIME$";
  const details = getSectionDetail(section, TIMINGS_SELECTOR, count);
  if (details.length === 0) {
    return err(new Error(`Failed to get timings`));
  }
  return ok(details);
};

/*
 * There's no text that says the course is open or not.
 * But there is an image that's returned. The image src
 * contains either OPEN or CLOSE
 *
 * So we return status based on that
 */
export const getStatus = (
  section: cheerio.Cheerio<AnyNode>,
  count: number,
): Result<boolean, Error> => {
  const STATUS_SELECTOR = "win0divDERIVED_CLSRCH_SSR_STATUS_LONG$";
  const statusSelector = getIdSelector(STATUS_SELECTOR, count);

  const { url } = section.find(statusSelector).extract({
    url: {
      selector: "img",
      value: "src",
    },
  });

  if (!url) {
    return err(new Error(`Failed to extract image`));
  }
  return url.includes("OPEN") ? ok(true) : ok(false);
};

/*
 * A course may have multiple sessions. Example:
 * Tu 16:00 - 17:20
 * Th 14:30 - 15:50
 */
export const processSessions = (
  term: string,
  courseCode: string,
  subSection: string,
  currentSection: string,
  instructors: string[],
  dates: string[],
  timings: string[],
) => {
  const sessions: SessionInsert[] = [];
  for (let sessionCount = 0; sessionCount < timings.length; sessionCount++) {
    // Extract day of week and time
    const currentTiming = timings[sessionCount];

    /*
     * Original format:
     * Tu 16:00 - 17:20
     */
    const timingDetails = currentTiming?.split(" ") as string[];
    const dayOfWeek = timingDetails[0];
    const startTime = timingDetails[1];
    const endTime = timingDetails[3];

    /*
     * Original Structure:
     * 2025-01-06 - 2025-04-05
     */
    const currMeetingDate = dates[sessionCount];
    let startDate, endDate;
    if (currMeetingDate === "-") {
      // HACK: If no dates are provided use this as a placeholder to indicate
      // that the date is unknown
      startDate = "1901-12-14";
      endDate = "1901-12-14";
    } else {
      [startDate, endDate] = currMeetingDate?.split(" - ") as string[];
    }

    sessions.push({
      courseCode,
      term,
      section: currentSection,
      subSection,
      dayOfWeek: dayOfWeek as string,
      startTime: startTime as string,
      endTime: endTime as string,
      startDate: startDate as string,
      endDate: endDate as string,
      instructor: instructors[sessionCount] as string,
      isDeleted: false,
    });
  }
  return sessions;
};
