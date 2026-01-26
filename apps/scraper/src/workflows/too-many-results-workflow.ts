import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { handleScraping } from "../utils/scraper.js";

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
    const uniqueCourses = new Set();
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
        { retries: { limit: 4, delay: "3 seconds", backoff: "constant" } },
        async () => {
          const results = await handleScraping(
            { term, value: termCode },
            year,
            subject,
            english,
            french,
            component,
          );

          if (results.isErr()) {
            throw new Error(results.error.message);
          }

          results.value.courses.forEach(course =>
            uniqueCourses.add(course.courseCode),
          );
        },
      );
    }

    const uniqueCoursesArray = [...uniqueCourses];

    for (const course of uniqueCoursesArray) {
      await step.do(
        `scrape-course-${course}`,
        { retries: { limit: 4, delay: "3 seconds", backoff: "constant" } },
        async () => {},
      );
    }
  }
}
