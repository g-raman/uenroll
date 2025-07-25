import * as cheerio from "cheerio";
import { COURSE_REGISTRY_URL } from "../utils/constants.js";
import { fetchCookie } from "../utils/cookies.js";
import {
  deleteTerms,
  getAvailableTerms,
  updateAvailableTerms,
} from "@repo/db/queries";
import type { TermInsert } from "@repo/db/types";
import { logger } from "../utils/logger.js";

const response = await fetchCookie(COURSE_REGISTRY_URL);
const html = await response.text();
const $ = cheerio.load(html);

const newlyAvailableTerms: TermInsert[] = [];
$("[id='CLASS_SRCH_WRK2_STRM$35$']")
  .find("option")
  .each(function (this) {
    const option = $(this);

    if (option.attr("value") === "") {
      return;
    }
    const term = option.text();
    const value = option.attr("value") as string;

    newlyAvailableTerms.push({
      term,
      value,
    });
  });

const currentAvailableTerms = await getAvailableTerms();
if (currentAvailableTerms.isErr()) {
  logger.error(currentAvailableTerms.error);
  process.exit(1);
}
const updateAvailableTermsResult =
  await updateAvailableTerms(newlyAvailableTerms);
if (updateAvailableTermsResult.isErr()) {
  logger.error(updateAvailableTermsResult.error);
}

const termsToDelete = currentAvailableTerms.value.filter(
  currentAvailableTerm =>
    !newlyAvailableTerms.some(
      newlyAvailableTerm =>
        newlyAvailableTerm.term === currentAvailableTerm.term,
    ),
);
const deleteTermsResult = await deleteTerms(termsToDelete);
if (deleteTermsResult.isErr()) {
  logger.error(deleteTermsResult.error);
}

process.exit(0);
