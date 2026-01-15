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
import { createDb } from "../lib/db.js";

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
export class TermsWorkflow extends WorkflowEntrypoint<Env, void> {
  override async run(_: WorkflowEvent<void>, step: WorkflowStep) {
    // Step 1: Scrape available terms from uOttawa
    const scrapedTerms = await step.do(
      "scrape-terms",
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        const result = await scrapeAvailableTerms();

        if (result.isErr()) {
          throw new Error(`Failed to scrape terms: ${result.error.message}`);
        }

        console.log(`Scraped ${result.value.length} terms`);
        return result.value as TermInsert[];
      },
    );

    // Step 2: Get current terms from database (for comparison)
    const currentTerms = await step.do("fetch-current-terms", async () => {
      const db = createDb(this.env);
      const result = await getAvailableTerms(db);

      if (result.isErr()) {
        throw new Error(
          `Failed to fetch current terms: ${result.error.message}`,
        );
      }

      return result.value;
    });

    // Step 3: Update database with new terms
    await step.do("update-terms-db", async () => {
      const db = createDb(this.env);
      const result = await updateAvailableTerms(scrapedTerms, db);

      if (result.isErr()) {
        throw new Error(`Failed to update terms: ${result.error.message}`);
      }

      console.log("Updated terms in database");
      return { updated: true };
    });

    // Step 4: Delete outdated terms
    await step.do("delete-outdated-terms", async () => {
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
        // Don't throw - this is not critical
        return { deleted: 0, error: result.error.message };
      }

      console.log(`Deleted ${termsToDelete.length} outdated terms`);
      return { deleted: termsToDelete.length };
    });

    // Step 5: Scrape available subjects
    const scrapedSubjects = await step.do(
      "scrape-subjects",
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential",
        },
      },
      async () => {
        const result = await scrapeAvailableSubjects();

        if (result.isErr()) {
          throw new Error(`Failed to scrape subjects: ${result.error.message}`);
        }

        console.log(`Scraped ${result.value.length} subjects`);
        return result.value as SubjectInsert[];
      },
    );

    // Step 6: Update database with subjects
    await step.do("update-subjects-db", async () => {
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
