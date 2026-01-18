import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { upsertCourseDetails } from "@repo/db/queries";
import { createDb } from "../utils/db.js";
import { handleScrapingWithSession } from "../utils/scraper.js";
import { getSession } from "../utils/cookies.js";
import { defaultConfig, FIRST_YEAR, LAST_YEAR } from "../utils/constants.js";

export interface SubjectBatchWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
  subjects: string[]; // Array of subject codes (max 30)
}

/**
 * Workflow to scrape a batch of subjects for a specific term.
 *
 * This workflow handles a batch of at most 30 subjects:
 * 1. Get session (ICSID + cookies) once at the start
 * 2. For each subject and year (1-5), scrape course data using that session
 * 3. Handle the 300-result limit by splitting into English/French queries
 */
export class SubjectBatchWorkflow extends WorkflowEntrypoint<
  Env,
  SubjectBatchWorkflowParams
> {
  override async run(
    event: WorkflowEvent<SubjectBatchWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { term, termCode, subjects } = event.payload;

    console.log(
      `Starting batch workflow for ${subjects.length} subjects in term: ${term}`,
    );

    // Step 1: Get session (ICSID + cookies) once for the entire batch
    const session = await step.do(
      "get-session",
      {
        retries: {
          limit: 8,
          delay: "5 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        const sessionResult = await getSession();

        if (sessionResult.isErr()) {
          throw new Error(
            `Failed to get session: ${sessionResult.error.message}`,
          );
        }

        return sessionResult.value;
      },
    );

    // Create term object for scraping functions
    const termObj = { term: termCode, value: term };

    // Step 2-N: Scrape each subject and year combination using the session
    for (const subject of subjects) {
      for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
        await step.do(
          `scrape-${subject}-year${year}`,
          defaultConfig,
          async () => {
            const db = createDb(this.env);

            // First try with both languages
            const bothLanguages = await handleScrapingWithSession(
              session,
              termObj,
              year,
              subject,
              true,
              true,
            );

            if (
              bothLanguages.isErr() &&
              bothLanguages.error.message === "Search results exceed 300 items."
            ) {
              // Split into English and French queries
              console.log(
                `Splitting ${subject} year ${year} into separate language queries`,
              );

              // English only
              const english = await handleScrapingWithSession(
                session,
                termObj,
                year,
                subject,
                true,
                false,
              );

              if (english.isOk()) {
                const result = await upsertCourseDetails(english.value, db);
                if (result.isErr()) {
                  console.error(
                    `Failed to upsert English courses for ${subject}: ${result.error}`,
                  );
                } else {
                  console.log(
                    `Updated ${english.value.courses.length} English courses for ${subject}`,
                  );
                }
              } else {
                console.error(
                  `Failed to scrape English ${subject}: ${english.error.message}`,
                );
              }

              // French only
              const french = await handleScrapingWithSession(
                session,
                termObj,
                year,
                subject,
                false,
                true,
              );

              if (french.isOk()) {
                const result = await upsertCourseDetails(french.value, db);
                if (result.isErr()) {
                  console.error(
                    `Failed to upsert French courses for ${subject}: ${result.error}`,
                  );
                } else {
                  console.log(
                    `Updated ${french.value.courses.length} French courses for ${subject}`,
                  );
                }
              } else {
                console.error(
                  `Failed to scrape French ${subject}: ${french.error.message}`,
                );
              }

              return {
                subject,
                year,
                success: true,
                split: true,
              };
            } else if (bothLanguages.isErr()) {
              // Other error (no results, etc.) - log but don't fail
              console.log(
                `No results for ${subject} year ${year}: ${bothLanguages.error.message}`,
              );
              return {
                subject,
                year,
                success: false,
                error: bothLanguages.error.message,
              };
            } else {
              // Success with both languages
              const result = await upsertCourseDetails(bothLanguages.value, db);
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
              };
            }
          },
        );

        await step.sleep("sleep", "1 second");
      }
    }

    console.log(`Batch workflow completed for ${subjects.length} subjects`);
  }
}
