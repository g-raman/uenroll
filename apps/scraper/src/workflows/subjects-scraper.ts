import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  FIRST_YEAR,
  LAST_YEAR,
  SCRAPING_RETRY_CONFIG,
} from "../utils/constants.js";
import { handleTooManyResults, scrapeAndUpsert } from "../utils/workflows.js";

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
 * 1. For each subject and year (1-5), scrape course data
 * 2. Handle the 300-result limit by splitting into English/French queries
 * 3. If still too many results, scrape individual courses by component and number
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

    const termObj = { term: termCode, value: term };

    for (const subject of subjects) {
      for (let year = FIRST_YEAR; year < LAST_YEAR; year++) {
        try {
          const bothLanguagesResult = await step.do(
            `scrape-${subject}-year-${year}`,
            SCRAPING_RETRY_CONFIG,
            async () =>
              scrapeAndUpsert(this.env, termObj, year, subject, true, true),
          );

          if (!bothLanguagesResult.needsSplit) continue;

          const englishResult = await step.do(
            `scrape-${subject}-year-${year}-english`,
            SCRAPING_RETRY_CONFIG,
            async () =>
              scrapeAndUpsert(this.env, termObj, year, subject, true, false),
          );

          if (englishResult.needsSplit) {
            await handleTooManyResults(
              this.env,
              step,
              termObj,
              subject,
              year,
              true,
              false,
            );
          }

          const frenchResult = await step.do(
            `scrape-${subject}-year-${year}-french`,
            SCRAPING_RETRY_CONFIG,
            async () =>
              scrapeAndUpsert(this.env, termObj, year, subject, false, true),
          );

          if (frenchResult.needsSplit) {
            await handleTooManyResults(
              this.env,
              step,
              termObj,
              subject,
              year,
              false,
              true,
            );
          }
        } catch {
          continue;
        }
      }
    }

    console.log(`Batch workflow completed for ${subjects.length} subjects`);
  }
}
