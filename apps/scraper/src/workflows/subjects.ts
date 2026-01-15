import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  getAvailableSubjects,
  upsertCourseDetails,
  removeOldSessions,
  removeCoursesWithNoSessions,
} from "@repo/db/queries";
import { createDb } from "../utils/db.js";
import { handleScraping } from "../utils/scraper.js";
import { defaultConfig, FIRST_YEAR, LAST_YEAR } from "../utils/constants.js";

export interface SubjectsWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
}

/**
 * Workflow to scrape all subjects for a specific term.
 *
 * This workflow is triggered once per term and iterates through all subjects
 * and years to scrape course data.
 *
 * Flow:
 * 1. Fetch all subjects from database
 * 2. For each subject and year (1-5), scrape course data
 * 3. Handle the 300-result limit by splitting into English/French queries
 * 4. Cleanup old sessions
 */
export class SubjectsWorkflow extends WorkflowEntrypoint<
  Env,
  SubjectsWorkflowParams
> {
  override async run(
    event: WorkflowEvent<SubjectsWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { term, termCode } = event.payload;

    console.log(`Starting subjects workflow for term: ${term} (${termCode})`);

    // Step 1: Get all subjects from database
    const subjects = await step.do("get-subjects", defaultConfig, async () => {
      const db = createDb(this.env);
      const result = await getAvailableSubjects(db);

      if (result.isErr()) {
        throw new Error(`Failed to fetch subjects: ${result.error.message}`);
      }

      return result.value;
    });

    console.log(`Found ${subjects.length} subjects to process`);

    // Create term object for scraping functions
    const termObj = { term: termCode, value: term };

    // Step 2-N: Scrape each subject and year combination
    // Each subject-year combo is a separate step for durability
    for (const subject of subjects) {
      for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
        await step.do(
          `scrape-${subject}-year${year}`,
          defaultConfig,
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
              bothLanguages.error.message === "Search results exceed 300 items."
            ) {
              // Split into English and French queries
              console.log(
                `Splitting ${subject} year ${year} into separate language queries`,
              );

              // English only
              const english = await handleScraping(
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
              const french = await handleScraping(
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
      }
    }

    // Final step: Cleanup old sessions
    await step.do("cleanup-old-sessions", defaultConfig, async () => {
      const db = createDb(this.env);

      // Remove sessions older than 5 hours
      const removeSessionsResult = await removeOldSessions(
        5 * 60 * 60 * 1000,
        db,
      );

      if (removeSessionsResult.isErr()) {
        console.error(
          `Failed to remove old sessions: ${removeSessionsResult.error.message}`,
        );
      } else {
        console.log("Removed old sessions");
      }

      // Remove courses with no sessions
      const removeCoursesResult = await removeCoursesWithNoSessions(db);

      if (removeCoursesResult.isErr()) {
        console.error(
          `Failed to remove courses with no sessions: ${removeCoursesResult.error.message}`,
        );
      } else {
        console.log("Removed courses with no sessions");
      }

      return { cleanup: true };
    });

    console.log(`Subjects workflow completed for term: ${term}`);
  }
}
