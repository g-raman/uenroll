import { Page } from 'puppeteer';
import supabase from './supabase';

async function updateCourseDetails(course, courseComponents, sessions) {
  console.log(`Inserting data for ${course.courseCode}...`);
  const { error: courseInsertError } = await supabase.from('courses').insert(course);

  if (courseInsertError) {
    console.log(courseInsertError);
  }

  const { error: componentInsertError } = await supabase.from('courseComponents').insert(courseComponents);

  if (componentInsertError) {
    console.log(componentInsertError);
  }

  const { error: sessionInsertError } = await supabase.from('sessions').insert(sessions);
  if (sessionInsertError) {
    console.log(sessionInsertError);
  }
}

async function scrapeSearchResults(page: Page, term: string) {
  // Gets a list of all the course titles
  const courses = await page.evaluate(() => {
    const courseInfoSelector = '.PAGROUPBOXLABELLEVEL1';
    const courseInfoElements = document.querySelectorAll(courseInfoSelector) as NodeListOf<HTMLTableDataCellElement>;
    const courseInfo = Array.from(courseInfoElements).map((courseTitleElem) => {
      const [courseCode, courseTitle] = courseTitleElem.innerText.trim().replace(/ /, '').split(' - ');
      return { courseCode, courseTitle };
    });
    return courseInfo;
  });

  // Processes the list of components
  for (let i = 0; i < courses.length; i++) {
    const { courseCode, courseTitle } = courses[i];

    const { courseComponents, sessions } = await page.evaluate(
      (i, courseCode, term) => {
        const courseComponentTableSelector = `[id^='win0div$ICField48$${i}'`;
        const courseComponentTableElem = document.querySelector(courseComponentTableSelector);

        const courseComponentSelector = "[id^='ACE_SSR_CLSRSLT_WRK_GROUPBOX3$']";
        const courseComponentElems = courseComponentTableElem?.querySelectorAll(
          courseComponentSelector,
        ) as NodeListOf<HTMLTableElement>;

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

          const newSectionRegex = /^[A-Z]?[A-Z]00$/;
          const isNewSection = newSectionRegex.test(subSection);
          currSection = isNewSection ? subSection : currSection;

          // Extract component type
          const type = sectionInfoElem.innerText.split('-')[1].split('\n')[0];

          // Extract status
          const isOpen = Boolean(statusElem.querySelector('img')?.src.match(/OPEN/));

          const course = {
            courseCode,
            subSection,
            type,
            isOpen,
            section: currSection,
            term,
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
              courseCode,
              section: currSection,
              subSection,
              dayOfWeek,
              startTime,
              endTime,
              startDate,
              endDate,
              instructor: instructors[k],
              term,
            };
            sessions.push(session);
          }

          courseComponents.push(course);
        }
        return { courseComponents, sessions };
      },
      i,
      courseCode,
      term,
    );

    const course = { courseCode, courseTitle, term };
    updateCourseDetails(course, courseComponents, sessions);
  }
}

export default scrapeSearchResults;
