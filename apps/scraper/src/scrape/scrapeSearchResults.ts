import type {
  Course,
  CourseComponent,
  CourseDetails,
  Session,
  Term,
} from "../utils/types.js";
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

export default ($: cheerio.Root, term: Term): CourseDetails => {
  const totalSections = getTotalSections($);
  let sectionNumber = 0;

  const details: CourseDetails = {
    courses: [] as Course[],
    courseComponents: [] as CourseComponent[],
    sessions: [] as Session[],
  };

  const allCourseContainersSelector = getIdStartsWithSelector(
    COURSE_CONTAINER_SELECTOR,
  );
  const allCourses = $(allCourseContainersSelector);

  const allCourseTitleSelector = getIdStartsWithSelector(COURSE_TITLE_SELECTOR);
  const courses = allCourses.find(allCourseTitleSelector);
  courses.each(function (this: cheerio.Element, courseNumber) {
    const courseContainerSelector = getIdSelector(
      COURSE_CONTAINER_SELECTOR,
      courseNumber,
    );
    const courseContainer = $(courseContainerSelector);
    const [courseCode, courseTitle] = getCourseCodeAndCourseTitle($(this));

    const sectionSelector = getIdStartsWithSelector(SECTION_SELECTOR);
    const sectionDetails = courseContainer.find(sectionSelector);

    let currentSection = "";
    sectionDetails.each(function (this: cheerio.Element) {
      const section = $(this);
      const [subSection, type] = getSectionAndType(section, sectionNumber);
      const instructors = getInstructors(section, sectionNumber);
      const dates = getDates(section, sectionNumber);
      const timings = getTimings(section, sectionNumber);
      const isOpen = getStatus(section, sectionNumber);

      const newSectionRegex = /^[A-Z]?[A-Z]00$/;
      const isNewSection = newSectionRegex.test(subSection as string);
      currentSection = isNewSection
        ? (subSection as string)
        : (currentSection as string);

      const sessions = processSessions(
        term.value,
        courseCode as string,
        subSection as string,
        currentSection,
        instructors,
        dates,
        timings,
      );

      details.sessions.push(...sessions);

      details.courseComponents.push({
        term: term.value,
        courseCode: courseCode as string,
        section: currentSection,
        subSection: subSection as string,
        type: type as string,
        isOpen,
        isDeleted: false,
      });
      sectionNumber++;

      if (sectionNumber >= totalSections) {
        return false;
      }
    });

    details.courses.push({
      courseCode: courseCode as string,
      courseTitle: courseTitle as string,
      term: term.value,
      isDeleted: false,
    });
  });

  return details;
};
