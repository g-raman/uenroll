import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "./constants.js";
import makeFetchCookie from "fetch-cookie";
import { err, Result, ResultAsync } from "neverthrow";

export const fetchCookie = makeFetchCookie(fetch);

export const getICSID = async () => {
  const initialResponse = await ResultAsync.fromPromise(
    fetchCookie(COURSE_REGISTRY_URL, {
      method: "GET",
    }),
    error => new Error(`Failed to fetch course registry HTML: ${error}`),
  );

  if (initialResponse.isErr()) {
    return err(initialResponse.error);
  }

  const initialHtml = await ResultAsync.fromPromise(
    initialResponse.value.text(),
    error => new Error(`Failed to parse HTML response: ${error}`),
  );

  if (initialHtml.isErr()) {
    return err(initialHtml.error);
  }

  const icsid = Result.fromThrowable(
    () => {
      const $ = cheerio.load(initialHtml.value);
      return $("input[name=ICSID]").attr("value");
    },
    error => new Error(`Failed to get ICSID: ${error}`),
  )();

  return icsid;
};
