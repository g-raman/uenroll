import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { handleScraping } from "../utils/scraper.js";
import { upsertCourseDetails } from "@repo/db/queries";
import { createDb } from "../utils/db.js";
import { NonRetryableError } from "cloudflare:workflows";

export interface TooManyResultsWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
  subject: string;
  year: number;
  english: boolean;
  french: boolean;
}

export class TooManyResultsWorkflow extends WorkflowEntrypoint<
  Env,
  TooManyResultsWorkflowParams
> {
  override async run(
    event: WorkflowEvent<TooManyResultsWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { term, termCode, subject, year, english, french } = event.payload;
    const termObj = { term: termCode, value: term };
    const uniqueCourses = new Set<string>();
    const components = [
      "ADM",
      "TST",
      "DGD",
      "LAB",
      "LEC",
      "MTR",
      "PRA",
      "REC",
      "SEM",
      "TLB",
      "TUT",
      "STG",
    ];

    for (const component of components) {
      await step.do(
        "get-unique-courses",
        { retries: { limit: 4, delay: "3 seconds", backoff: "linear" } },
        async () => {
          const results = await handleScraping(
            termObj,
            year,
            subject,
            english,
            french,
            component,
          );

          if (
            results.isErr() &&
            results.error.message === "No search results found."
          ) {
            throw new Error(results.error.message);
          }

          if (results.isErr()) {
            console.log(results.error.message);
            return;
          }

          results.value.courses.forEach(course =>
            uniqueCourses.add(course.courseCode),
          );
        },
      );
    }

    const uniqueCoursesArray = [...uniqueCourses];

    for (const course of uniqueCoursesArray) {
      let number = null;
      try {
        number = Number.parseInt(course.substring(4));
      } catch {
        continue;
      }

      if (number === null) continue;

      await step.do(
        `scrape-course-${course}`,
        { retries: { limit: 4, delay: "3 seconds", backoff: "constant" } },
        async () => {
          const db = createDb(this.env);

          const courseDetails = await handleScraping(
            termObj,
            year,
            subject,
            english,
            french,
            "",
            number,
          );

          if (
            courseDetails.isErr() &&
            (courseDetails.error.message ===
              "Search results exceed 300 items." ||
              courseDetails.error.message === "No classes found.")
          ) {
            throw new NonRetryableError(courseDetails.error.message);
          } else if (
            courseDetails.isErr() &&
            courseDetails.error.message === "No search results found."
          ) {
            throw new Error(courseDetails.error.message);
          } else if (courseDetails.isErr()) {
            // Other error (no results, etc.) - log but don't fail
            console.log(
              `No results for ${subject} year ${year}: ${courseDetails.error.message}`,
            );
            return {
              subject,
              year,
              success: false,
              needsSplit: false,
              coursesUpdated: 0,
              error: courseDetails.error.message,
            };
          } else {
            const result = await upsertCourseDetails(courseDetails.value, db);
            if (result.isErr()) {
              console.error(
                `Failed to upsert courses for ${subject}: ${result.error}`,
              );
            } else {
              console.log(
                `Updated ${courseDetails.value.courses.length} courses for ${subject}`,
              );
            }

            return {
              subject,
              year,
              success: true,
              coursesUpdated: courseDetails.value.courses.length,
              needsSplit: false,
              error: null,
            };
          }
        },
      );
    }
  }
}
