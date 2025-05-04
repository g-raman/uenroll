import { Session } from "./types";
import cheerio from "cheerio";

/*
 * Selects the error message.
 * Two possible messages
 * 1. No classes found
 * 2. Your search will exceed the maximum limit of 300 sections. Specify additional criteria to continue.
 */
export const getError = ($: cheerio.Root) => {
  const ERROR_SELECTOR = "[id='win0divDERIVED_CLSMSG_ERROR_TEXT']";

  const error = $(ERROR_SELECTOR).text();
  if (error.includes("exceed")) {
    return "Search results exceed 300 items.";
  } else if (error.includes("No classes found")) {
    return "No classes found.";
  }
  return null;
};

export const getElementChildText = (
  element: cheerio.Cheerio,
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
  section: cheerio.Cheerio,
  selector: string,
  count: number,
) => {
  const subSectionSelector = getIdSelector(selector, count);
  return getElementChildText(section, subSectionSelector);
};

/*
 * Gets total numer of search results
 */
export const getTotalSections = ($: cheerio.Root) => {
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
export const getCourseCodeAndCourseTitle = (course: cheerio.Cheerio) => {
  const courseHeader = course.text().trim();
  const [courseCodeString, courseTitle] = courseHeader.split(" - ");
  const courseCode = courseCodeString.replaceAll(" ", "");

  return [courseCode, courseTitle];
};

/*
 * Original Structure:
 * M00-LEC<br>FullSess.
 *
 * We discard the last part as that's unecessary
 * We return the sub section and the component type
 */
export const getSectionAndType = (section: cheerio.Cheerio, count: number) => {
  const SUB_SECTION_SELECTOR = "MTG_CLASSNAME$";

  const subSectionDetails = getSectionDetail(
    section,
    SUB_SECTION_SELECTOR,
    count,
  )[0];
  const [subSection, type] = subSectionDetails.split("-");
  return [subSection, type];
};

/*
 * Original Structure:
 * Alan O'Sullivan<br>Alan O'Sullivan
 *
 * Easy split. Returns an array
 */
export const getInstructors = (section: cheerio.Cheerio, count: number) => {
  const INSTRUCTOR_SELECTOR = "MTG_INSTR$";
  return getSectionDetail(section, INSTRUCTOR_SELECTOR, count);
};

/*
 * Original Structure:
 * 2025-01-06 - 2025-04-05<br>2025-01-06 - 2025-04-05
 *
 * Easy split. Returns an array
 */
export const getDates = (section: cheerio.Cheerio, count: number) => {
  const DATES_SELECTOR = "MTG_TOPIC$";
  return getSectionDetail(section, DATES_SELECTOR, count);
};

/*
 * Original Structure:
 *
 * Tu 16:00 - 17:20<br>Th 14:30 - 15:50
 *
 * Easy split. Returns an array
 */
export const getTimings = (section: cheerio.Cheerio, count: number) => {
  const TIMINGS_SELECTOR = "MTG_DAYTIME$";
  return getSectionDetail(section, TIMINGS_SELECTOR, count);
};

/*
 * There's no text that says the course is open or not.
 * But there is an image that's returned. The image src
 * contains either OPEN or CLOSE
 *
 * So we return status based on that
 */
export const getStatus = (section: cheerio.Cheerio, count: number) => {
  const STATUS_SELECTOR = "win0divDERIVED_CLSRCH_SSR_STATUS_LONG$";
  const statusSelector = getIdSelector(STATUS_SELECTOR, count);

  // The @types/cheerio package is not up to date
  // @ts-ignore
  const { url } = section.find(statusSelector).extract({
    url: {
      selector: "img",
      value: "src",
    },
  });
  return url?.includes("OPEN") ? true : false;
};

/*
 * A course may have mutliple sessions. Example:
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
  const sessions: Session[] = [];
  for (let sessionCount = 0; sessionCount < timings.length; sessionCount++) {
    // Extract day of week and time
    const currentTiming = timings[sessionCount];

    /*
     * Actual course info still gets added and sub section info is stored.
     * However, since there are no sessions. Nothing is returned to the front end.
     */
    if (currentTiming.includes("N/A")) {
      continue;
    }

    /*
     * Original format:
     * Tu 16:00 - 17:20
     */
    const timingDetails = currentTiming.split(" ");
    const dayOfWeek = timingDetails[0];
    const startTime = timingDetails[1];
    const endTime = timingDetails[3];

    /*
     * Original Structure:
     * 2025-01-06 - 2025-04-05
     */
    const currMeetingDate = dates[sessionCount];
    const [startDate, endDate] = currMeetingDate.split(" - ");

    sessions.push({
      courseCode,
      term,
      section: currentSection,
      subSection,
      dayOfWeek,
      startTime,
      endTime,
      startDate,
      endDate,
      instructor: instructors[sessionCount],
      isDeleted: false,
    });
  }
  return sessions;
};
