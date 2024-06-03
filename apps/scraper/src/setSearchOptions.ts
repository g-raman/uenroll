import { Page } from 'puppeteer';
import { term } from './types';

async function setSearchOptions(page: Page, subject: string, year: number, term: term) {
  await page.evaluate(
    (subject, year, term) => {
      const subjectFieldSelector = 'SSR_CLSRCH_WRK_SUBJECT$0';
      const courseCodeFieldSelector = 'SSR_CLSRCH_WRK_CATALOG_NBR$0';
      const courseCodeFilterSelector = 'SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$0';
      const showClosedCourseSelector = 'SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$0';
      const termFieldSelector = 'CLASS_SRCH_WRK2_STRM$35$';

      const yearSelector = `UO_PUB_SRCH_WRK_SSR_RPTCK_OPT_0${year}$chk$0`;
      const gradSelector = 'UO_PUB_SRCH_WRK_GRADUATED_TBL_CD$chk$0';
      const yearFilterSelector = year < 5 ? yearSelector : gradSelector;

      const submitBtnSelector = 'CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH';

      const subjectField = document.getElementById(subjectFieldSelector) as HTMLInputElement;
      subjectField.value = subject;

      const courseCodeField = document.getElementById(courseCodeFieldSelector) as HTMLInputElement;
      courseCodeField.value = '0';

      const courseCodeFilterField = document.getElementById(courseCodeFilterSelector) as HTMLSelectElement;
      courseCodeFilterField.value = 'G';

      const showClosedCourseField = document.getElementById(showClosedCourseSelector) as HTMLSelectElement;
      showClosedCourseField.value = 'N';

      const yearField = document.getElementById(yearFilterSelector) as HTMLInputElement;
      yearField.value = 'Y';

      const termField = document.getElementById(termFieldSelector) as HTMLSelectElement;
      Array.from(termField.options).forEach((item) => {
        if (item.value !== term.value) {
          item.removeAttribute('selected');
        } else {
          item.setAttribute('selected', 'selected');
        }
      });

      const submitButton = document.getElementById(submitBtnSelector) as HTMLButtonElement;
      submitButton.click();
    },
    subject,
    year,
    term,
  );
}

export default setSearchOptions;
