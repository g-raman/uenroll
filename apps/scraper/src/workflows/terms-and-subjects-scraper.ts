import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import type { TermInsert, SubjectInsert } from "@repo/db/types";
import {
  getAvailableTerms,
  updateAvailableTerms,
  deleteTerms,
  updateAvailableSubjects,
} from "@repo/db/queries";
import { scrapeAvailableTerms } from "../scrape/terms.js";
import { scrapeAvailableSubjects } from "../scrape/subjects.js";
import { createDb } from "../utils/db.js";
import { defaultConfig } from "../utils/constants.js";

/**
 * Workflow to scrape and update available terms and subjects.
 *
 * Flow:
 * 1. Scrape available terms from uOttawa course registry
 * 2. Update database with new terms
 * 3. Delete outdated terms
 * 4. Scrape available subjects from uOttawa course catalogue
 * 5. Update database with subjects
 */
export class TermsAndSubjectsScraperWorkflow extends WorkflowEntrypoint<
  Env,
  void
> {
  override async run(_: WorkflowEvent<void>, step: WorkflowStep) {
    const scrapedTerms = await step.do(
      "scrape-terms",
      defaultConfig,
      async () => {
        const result = await scrapeAvailableTerms();

        if (result.isErr()) {
          throw new Error(`Failed to scrape terms: ${result.error.message}`);
        }

        console.log(`Scraped ${result.value.length} terms`);
        return result.value as TermInsert[];
      },
    );

    const currentTerms = await step.do(
      "get-current-terms",
      defaultConfig,
      async () => {
        const db = createDb(this.env);
        const result = await getAvailableTerms(db);

        if (result.isErr()) {
          throw new Error(
            `Failed to fetch current terms: ${result.error.message}`,
          );
        }

        return result.value;
      },
    );

    await step.do("update-terms", defaultConfig, async () => {
      const db = createDb(this.env);
      const result = await updateAvailableTerms(scrapedTerms, db);

      if (result.isErr()) {
        throw new Error(`Failed to update terms: ${result.error.message}`);
      }

      console.log("Updated terms in database");
      return { updated: true };
    });

    await step.do("delete-outdated-terms", defaultConfig, async () => {
      const termsToDelete = currentTerms.filter(
        currentTerm =>
          !scrapedTerms.some(
            scrapedTerm => scrapedTerm.term === currentTerm.term,
          ),
      );

      if (termsToDelete.length === 0) {
        console.log("No outdated terms to delete");
        return { deleted: 0 };
      }

      const db = createDb(this.env);
      const result = await deleteTerms(termsToDelete, db);

      if (result.isErr()) {
        console.error(`Failed to delete terms: ${result.error.message}`);
        return { deleted: 0, error: result.error.message };
      }

      console.log(`Deleted ${termsToDelete.length} outdated terms`);
      return { deleted: termsToDelete.length };
    });

    const scrapedSubjects = await step.do(
      "scrape-subjects",
      defaultConfig,
      async () => {
        const result = await scrapeAvailableSubjects();

        if (result.isErr()) {
          throw new Error(`Failed to scrape subjects: ${result.error.message}`);
        }

        console.log(`Scraped ${result.value.length} subjects`);
        return result.value as SubjectInsert[];
      },
    );

    await step.do("update-subjects-db", defaultConfig, async () => {
      const db = createDb(this.env);
      const result = await updateAvailableSubjects(scrapedSubjects, db);

      if (result.isErr()) {
        throw new Error(`Failed to update subjects: ${result.error.message}`);
      }

      console.log("Updated subjects in database");
      return { updated: true };
    });

    console.log("Terms workflow completed successfully");
  }
}
