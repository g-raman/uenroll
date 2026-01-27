import type { Term } from "@repo/db/types";
import type { ScrapeStepResults } from "../workflows/subjects-scraper.js";
import { createDb } from "./db.js";
import { handleScraping } from "./scraper.js";
import { NonRetryableError } from "cloudflare:workflows";
import { upsertCourseDetails } from "@repo/db/queries";
import type { WorkflowStep } from "cloudflare:workers";
import { COURSE_COMPONENTS, SCRAPING_RETRY_CONFIG } from "./constants.js";

export async function scrapeAndUpsert(
  env: Env,
  termObj: Term,
  year: number,
  subject: string,
  english: boolean,
  french: boolean,
  component?: string,
  courseNumber?: number,
): Promise<ScrapeStepResults> {
  const db = createDb(env);

  const result = await handleScraping(
    termObj,
    year,
    subject,
    english,
    french,
    component ?? "",
    courseNumber,
  );

  if (result.isErr()) {
    const errorMsg = result.error.message;

    if (errorMsg === "Search results exceed 300 items.") {
      return {
        subject,
        year,
        success: false,
        coursesUpdated: 0,
        needsSplit: true,
        error: null,
      };
    }

    if (errorMsg === "No search results found.") {
      throw new Error(errorMsg);
    }

    // Other error - log but don't fail
    console.log(`No results for ${subject} year ${year}: ${errorMsg}`);
    return {
      subject,
      year,
      success: false,
      needsSplit: false,
      coursesUpdated: 0,
      error: errorMsg,
    };
  }

  const upsertResult = await upsertCourseDetails(result.value, db);
  if (upsertResult.isErr()) {
    console.error(
      `Failed to upsert courses for ${subject}: ${upsertResult.error}`,
    );
  } else {
    console.log(
      `Updated ${result.value.courses.length} courses for ${subject}`,
    );
  }

  return {
    subject,
    year,
    success: true,
    coursesUpdated: result.value.courses.length,
    needsSplit: false,
    error: null,
  };
}

/**
 * Handles the "too many results" case by scraping individual courses.
 * First collects unique course codes by querying each component type,
 * then scrapes each course individually by number.
 */
export async function handleTooManyResults(
  env: Env,
  step: WorkflowStep,
  termObj: { term: string; value: string },
  subject: string,
  year: number,
  english: boolean,
  french: boolean,
): Promise<void> {
  const uniqueCourses = new Set<string>();

  for (const component of COURSE_COMPONENTS) {
    await step.do(
      `get-unique-courses-${subject}-${year}-${english ? "en" : "fr"}-${component}`,
      SCRAPING_RETRY_CONFIG,
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

  // Scrape each individual course by number
  for (const course of uniqueCourses) {
    let number: number | null = null;
    try {
      number = Number.parseInt(course.substring(3));
    } catch {
      continue;
    }

    if (number === null) continue;

    await step.do(
      `scrape-course-${subject}-${year}-${english ? "en" : "fr"}-${course}`,
      { retries: { limit: 4, delay: "3 seconds", backoff: "constant" } },
      async () => {
        const db = createDb(env);

        const courseDetails = await handleScraping(
          termObj,
          year,
          subject,
          english,
          french,
          "",
          number!,
        );

        if (courseDetails.isErr()) {
          const errorMsg = courseDetails.error.message;

          if (
            errorMsg === "Search results exceed 300 items." ||
            errorMsg === "No classes found."
          ) {
            throw new NonRetryableError(errorMsg);
          }

          if (errorMsg === "No search results found.") {
            throw new Error(errorMsg);
          }

          console.log(`No results for ${subject} year ${year}: ${errorMsg}`);
          return;
        }

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
      },
    );
  }
}
