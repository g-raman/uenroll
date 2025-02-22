import { CheerioAPI } from "cheerio";
import {
  Course,
  CourseComponent,
  CourseDetails,
  Session,
  Term,
} from "../utils/types.ts";
import {
  getIdStartsWithSelector,
  getIdSelector,
  getCourseCodeAndCourseTitle,
  getSectionAndType,
  getInstructors,
  getDates,
  getTimings,
  getStatus,
  processSessions,
  getTotalSections,
} from "../utils/scrape.ts";

const COURSE_CONTAINER_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2$";
const COURSE_TITLE_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX2GP$";
const SECTION_SELECTOR = "win0divSSR_CLSRSLT_WRK_GROUPBOX3$";

export default ($: CheerioAPI, term: Term): CourseDetails => {
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
  courses.each(function (courseNumber) {
    const courseContainerSelector = getIdSelector(
      COURSE_CONTAINER_SELECTOR,
      courseNumber,
    );
    const courseContainer = $(courseContainerSelector);
    const [courseCode, courseTitle] = getCourseCodeAndCourseTitle($(this));

    const sectionSelector = getIdStartsWithSelector(SECTION_SELECTOR);
    const sectionDetails = courseContainer.find(sectionSelector);

    let currentSection = "";
    sectionDetails.each(function () {
      const section = $(this);
      const [subSection, type] = getSectionAndType(section, sectionNumber);
      const instructors = getInstructors(section, sectionNumber);
      const dates = getDates(section, sectionNumber);
      const timings = getTimings(section, sectionNumber);
      const isOpen = getStatus(section, sectionNumber);

      const newSectionRegex = /^[A-Z]?[A-Z]00$/;
      const isNewSection = newSectionRegex.test(subSection);
      currentSection = isNewSection ? subSection : currentSection;

      const sessions = processSessions(
        term.term,
        courseCode,
        subSection,
        currentSection,
        instructors,
        dates,
        timings,
      );

      details.sessions.push(...sessions);

      details.courseComponents.push({
        term: term.term,
        courseCode,
        section: currentSection,
        subSection,
        type,
        isOpen,
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
      term: term.term,
      isDeleted: false,
    });
  });

  return details;
};
