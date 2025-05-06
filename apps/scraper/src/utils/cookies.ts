import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "./constants.js";
import makeFetchCookie from "fetch-cookie";

export const fetchCookie = makeFetchCookie(fetch);

export const getICSID = async () => {
  // Making initial get request to get the ICSID
  const initialResponse = await fetchCookie(COURSE_REGISTRY_URL, {
    method: "GET",
  });
  const initialHtml = await initialResponse.text();

  // Getting the ICSID token from the initial html
  const $ = cheerio.load(initialHtml);
  const ICSID = $("input[name=ICSID]").attr("value");

  return ICSID;
};
