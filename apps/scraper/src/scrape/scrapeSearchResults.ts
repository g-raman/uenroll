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
} from "../utils/scrape.js";
import * as cheerio from "cheerio";

const COURSE_CONTAINER_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2$";
const COURSE_TITLE_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2GP$";
const SECTION_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX3$";

export default (
  $: cheerio.CheerioAPI,
  term: Omit<Term, "isDeleted">,
): CourseDetailsInsert => {
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

      const newSectionRegex = /^[A-Z]?[A-Z]00$/;
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
};
