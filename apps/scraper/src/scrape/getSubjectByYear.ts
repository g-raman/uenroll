import {
  COURSE_REGISTRY_URL,
  MAX_RETRIES_FOR_ICSID,
} from "../utils/constants.js";
import type { Term } from "../utils/types.js";
import { fetchCookie, getICSID } from "../utils/cookies.js";

export default async function getSubjectByYear(
  term: Term,
  year: number,
  subject: string,
): Promise<string> {
  // Somtimes ICSID isn't found and it takes ~2-3 attempts to get one
  let icsid = undefined;
  let counter = 1;
  while (!icsid) {
    if (counter > MAX_RETRIES_FOR_ICSID) {
      console.log("Couldn't find ICSID");
      return "";
    }
    icsid = await getICSID();
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
  const response = await fetchCookie(COURSE_REGISTRY_URL, {
    method: "POST",
    body,
  });

  const courseHtml = await response.text();
  return courseHtml;
}
