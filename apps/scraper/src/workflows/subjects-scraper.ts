import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { upsertCourseDetails } from "@repo/db/queries";
import { createDb } from "../utils/db.js";
import { FIRST_YEAR, LAST_YEAR } from "../utils/constants.js";
import { handleScraping } from "../utils/scraper.js";
import { NonRetryableError } from "cloudflare:workflows";

export interface SubjectsScraperWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
  subjects: string[]; // Array of subject codes (max 30)
}

export interface ScrapeStepResults {
  subject: string;
  year: number;
  success: boolean;
  error: string | null;
  coursesUpdated: number;
  needsSplit: boolean;
}

/**
 * Workflow to scrape a batch of subjects for a specific term.
 *
 * This workflow handles a batch of at most 30 subjects:
 * 1. Get session (ICSID + cookies) once at the start
 * 2. For each subject and year (1-5), scrape course data using that session
 * 3. Handle the 300-result limit by splitting into English/French queries
 */
export class SubjectsScraperWorkflow extends WorkflowEntrypoint<
  Env,
  SubjectsScraperWorkflowParams
> {
  override async run(
    event: WorkflowEvent<SubjectsScraperWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { term, termCode, subjects } = event.payload;

    console.log(
      `Starting batch workflow for ${subjects.length} subjects in term: ${term}`,
    );

    // Create term object for scraping functions
    const termObj = { term: termCode, value: term };

    // Step 2-N: Scrape each subject and year combination using the session
    for (const subject of subjects) {
      for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
        try {
          const result: ScrapeStepResults = await step.do(
            `scrape-${subject}-year-${year}`,
            { retries: { limit: 4, backoff: "linear", delay: "3 seconds" } },
            async () => {
              const db = createDb(this.env);

              // First try with both languages
              const bothLanguages = await handleScraping(
                termObj,
                year,
                subject,
                true,
                true,
              );

              if (
                bothLanguages.isErr() &&
                bothLanguages.error.message ===
                  "Search results exceed 300 items."
              ) {
                // Signal that we need to split into separate language queries
                return {
                  subject,
                  year,
                  success: false,
                  coursesUpdated: 0,
                  needsSplit: true,
                  error: null,
                };
              } else if (
                bothLanguages.isErr() &&
                bothLanguages.error.message === "No search results found."
              ) {
                throw new Error(bothLanguages.error.message);
              } else if (bothLanguages.isErr()) {
                // Other error (no results, etc.) - log but don't fail
                console.log(
                  `No results for ${subject} year ${year}: ${bothLanguages.error.message}`,
                );
                return {
                  subject,
                  year,
                  success: false,
                  needsSplit: false,
                  coursesUpdated: 0,
                  error: bothLanguages.error.message,
                };
              } else {
                // Success with both languages
                const result = await upsertCourseDetails(
                  bothLanguages.value,
                  db,
                );
                if (result.isErr()) {
                  console.error(
                    `Failed to upsert courses for ${subject}: ${result.error}`,
                  );
                } else {
                  console.log(
                    `Updated ${bothLanguages.value.courses.length} courses for ${subject}`,
                  );
                }

                return {
                  subject,
                  year,
                  success: true,
                  coursesUpdated: bothLanguages.value.courses.length,
                  needsSplit: false,
                  error: null,
                };
              }
            },
          );

          if (!result.needsSplit) continue;

          // English only step with retry logic
          await step.do(
            `scrape-${subject}-year-${year}-english`,
            { retries: { limit: 4, backoff: "linear", delay: "3 seconds" } },
            async () => {
              const db = createDb(this.env);

              const english = await handleScraping(
                termObj,
                year,
                subject,
                true,
                false,
              );

              if (
                english.isErr() &&
                english.error.message === "Search results exceed 300 items."
              ) {
                await this.env.TOO_MANY_RESULTS_WORKFLOW.create({
                  params: {
                    term,
                    termCode,
                    subject,
                    year,
                    english: true,
                    french: false,
                  },
                });
                throw new NonRetryableError(english.error.message);
              }

              if (english.isErr()) {
                throw new Error(
                  `Failed to scrape English ${subject}: ${english.error.message}`,
                );
              }

              const upsertResult = await upsertCourseDetails(english.value, db);
              if (upsertResult.isErr()) {
                throw new Error(
                  `Failed to upsert English courses for ${subject}: ${upsertResult.error}`,
                );
              }

              console.log(
                `Updated ${english.value.courses.length} English courses for ${subject}`,
              );

              return {
                subject,
                year,
                language: "english",
                success: true,
                coursesUpdated: english.value.courses.length,
              };
            },
          );

          // French only step with retry logic
          await step.do(
            `scrape-${subject}-year-${year}-french`,
            { retries: { limit: 4, backoff: "linear", delay: "3 seconds" } },
            async () => {
              const db = createDb(this.env);

              const french = await handleScraping(
                termObj,
                year,
                subject,
                false,
                true,
              );

              if (
                french.isErr() &&
                french.error.message === "Search results exceed 300 items."
              ) {
                await this.env.TOO_MANY_RESULTS_WORKFLOW.create({
                  params: {
                    term,
                    termCode,
                    subject,
                    year,
                    english: false,
                    french: true,
                  },
                });
                throw new NonRetryableError(french.error.message);
              }

              if (french.isErr()) {
                throw new Error(
                  `Failed to scrape French ${subject}: ${french.error.message}`,
                );
              }

              const upsertResult = await upsertCourseDetails(french.value, db);
              if (upsertResult.isErr()) {
                throw new Error(
                  `Failed to upsert French courses for ${subject}: ${upsertResult.error}`,
                );
              }

              console.log(
                `Updated ${french.value.courses.length} French courses for ${subject}`,
              );

              return {
                subject,
                year,
                language: "french",
                success: true,
                coursesUpdated: french.value.courses.length,
              };
            },
          );
        } catch {
          continue;
        }
      }
    }

    console.log(`Batch workflow completed for ${subjects.length} subjects`);
  }
}
