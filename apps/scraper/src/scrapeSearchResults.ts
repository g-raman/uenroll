import { Page } from 'puppeteer';
import { Course, CourseComponent, CourseDetails, Session } from './utils/types';
import { upsertCourseDetails } from './supabase';

async function scrapeSearchResults(page: Page, term: string) {
  const details = await page.evaluate((term) => {
    const courseInfoSelector = '.PAGROUPBOXLABELLEVEL1';
    const courseInfoElements = document.querySelectorAll(courseInfoSelector) as NodeListOf<HTMLTableDataCellElement>;
    const courseInfo = Array.from(courseInfoElements).map((courseTitleElem) => {
      const [courseCode, courseTitle] = courseTitleElem.innerText.trim().replace(/ /, '').split(' - ');
      return { courseCode, courseTitle };
    });

    const details: CourseDetails = {
      courses: [] as Course[],
      courseComponents: [] as CourseComponent[],
      sessions: [] as Session[],
    };

    for (let i = 0; i < courseInfo.length; i++) {
      const courseComponentTableSelector = `[id^='win0div$ICField48$${i}'`;
      const courseComponentTableElem = document.querySelector(courseComponentTableSelector);

      const courseComponentSelector = "[id^='ACE_SSR_CLSRSLT_WRK_GROUPBOX3$']";
      const courseComponentElems = courseComponentTableElem?.querySelectorAll(
        courseComponentSelector,
      ) as NodeListOf<HTMLTableElement>;

      const currCourse = courseInfo[i];
      let currSection = '';
      const courseComponents = [];
      const sessions = [];

      for (let j = 0; j < courseComponentElems.length; j++) {
        const currCourseComponenetElem = courseComponentElems[j] as HTMLTableElement;

        const componentDetailSelector = '.PSLEVEL3GRIDODDROW';
        const componentDetailElems = currCourseComponenetElem.querySelectorAll(
          componentDetailSelector,
        ) as NodeListOf<HTMLTableCellElement>;

        const sectionInfoElem = componentDetailElems[1];
        const timingElem = componentDetailElems[2];
        const instructorElem = componentDetailElems[3];
        const meetingDatesElem = componentDetailElems[4];
        const statusElem = componentDetailElems[5];

        // Sanity checks
        if (timingElem.innerText.includes('N/A')) {
          continue;
        }

        // Extract subSection
        const subSection = sectionInfoElem.innerText.split('-')[0];

        // Determine if a new section has started
        const newSectionRegex = /^[A-Z]?[A-Z]00$/;
        const isNewSection = newSectionRegex.test(subSection);
        currSection = isNewSection ? subSection : currSection;

        // Extract component type
        const type = sectionInfoElem.innerText.split('-')[1].split('\n')[0];

        // Extract status
        const isOpen = Boolean(statusElem.querySelector('img')?.src.match(/OPEN/));

        const course = {
          courseCode: currCourse.courseCode,
          subSection,
          type,
          isOpen,
          section: currSection,
          term,
          isDeleted: false,
        };

        const timings = timingElem.innerText.split('\n');
        const instructors = instructorElem.innerText.split('\n');
        const meetingDates = meetingDatesElem.innerText.split('\n');

        for (let k = 0; k < timings.length; k++) {
          // Extract day of week and time
          const currTiming = timings[k];
          const splitDayAndTimings = currTiming.split(' ');
          const dayOfWeek = splitDayAndTimings[0];
          const startTime = splitDayAndTimings[1];
          const endTime = splitDayAndTimings[3];

          // Extract meeting dates
          const currMeetingDate = meetingDates[k];
          const [startDate, endDate] = currMeetingDate.split(' - ');

          const session = {
            courseCode: currCourse.courseCode,
            section: currSection,
            subSection,
            dayOfWeek,
            startTime,
            endTime,
            startDate,
            endDate,
            instructor: instructors[k],
            term,
            isDeleted: false,
          };
          sessions.push(session);
        }
        courseComponents.push(course);
      }
      const course = {
        courseCode: currCourse.courseCode,
        courseTitle: currCourse.courseTitle,
        term,
        isDeleted: false,
      };

      if (courseComponents.length === 0 || sessions.length === 0) {
        continue;
      }
      details.courses.push(course);
      details.courseComponents = courseComponents;
      details.sessions = sessions;
    }

    return details;
  }, term);

  if (details.courses.length !== 0 && details.courseComponents.length !== 0 && details.sessions.length !== 0) {
    upsertCourseDetails(details);
  }
  await page.evaluate(() => {
    document.getElementById('CLASS_SRCH_WRK2_SSR_PB_MODIFY')?.click();
  });
}

export default scrapeSearchResults;
