import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { createDb } from "../utils/db.js";
import {
  getAvailableTerms,
  removeOldSessions,
  removeCoursesWithNoSessions,
} from "@repo/db/queries";
import { defaultConfig } from "../utils/constants.js";

/**
 * Main orchestrator workflow that coordinates the scraping process.
 *
 * Flow:
 * 1. Trigger workflow to scrape available terms and subjects
 * 2. Wait for TermsWorkflow to complete
 * 3. Fetch the newly available terms in the database
 * 4. Trigger a term orchestrator workflow for each term
 * 5. Wait for all term orchestrator workflows to complete
 * 6. Cleanup outdated sessions and courses with no sessions
 */
export class OrchestratorWorkflow extends WorkflowEntrypoint<Env, void> {
  override async run(_: WorkflowEvent<void>, step: WorkflowStep) {
    const termsInstance = await step.do("trigger-terms-workflow", async () => {
      const instance =
        await this.env.TERMS_AND_SUBJECTS_SCRAPER_WORKFLOW.create();
      return { id: instance.id };
    });

    await step.do(
      "wait-for-terms",
      // Max 5 minutes of waiting
      { retries: { limit: 30, delay: "10 seconds", backoff: "constant" } },
      async () => {
        const instance = await this.env.TERMS_AND_SUBJECTS_SCRAPER_WORKFLOW.get(
          termsInstance.id,
        );
        const status = await instance.status();

        if (status.status === "errored") {
          throw new Error(`Terms workflow errored: ${JSON.stringify(status)}`);
        }

        if (status.status !== "complete") {
          throw new Error(`Terms workflow still ${status.status}`);
        }

        return { status: status.status };
      },
    );

    const terms = await step.do("fetch-terms", async () => {
      const db = createDb(this.env);
      const result = await getAvailableTerms(db);

      if (result.isErr()) {
        throw new Error(`Failed to fetch terms: ${result.error.message}`);
      }

      return result.value;
    });

    const termWorkflowIds = await step.do(
      "trigger-term-orchestrator-workflows",
      defaultConfig,
      async () => {
        const termWorkflows = terms.map(term => ({
          params: {
            term: term.value,
            termCode: term.term,
          },
        }));

        const instances =
          await this.env.TERM_ORCHESTRATOR_WORKFLOW.createBatch(termWorkflows);

        return instances.map(instance => instance.id);
      },
    );

    for (let i = 0; i < termWorkflowIds.length; i++) {
      const workflowId = termWorkflowIds[i];
      if (!workflowId) continue;

      await step.do(
        `wait-for-term-${i}`,
        // Allow up to 10 retries (20 minutes max per term)
        { retries: { limit: 10, delay: "2 minutes", backoff: "constant" } },
        async () => {
          const instance =
            await this.env.TERM_ORCHESTRATOR_WORKFLOW.get(workflowId);
          const status = await instance.status();

          if (status.status === "running" || status.status === "queued") {
            throw new Error(`Term workflow ${i + 1} still ${status.status}`);
          }

          if (status.status === "errored") {
            console.error(`Term workflow ${i + 1} errored: ${status.error}`);
          }

          return { workflowId, status: status.status };
        },
      );
    }

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
    });
  }
}
