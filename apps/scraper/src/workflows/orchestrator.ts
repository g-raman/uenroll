import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { createDb } from "../utils/db.js";
import { getAvailableTerms } from "@repo/db/queries";
import { defaultConfig } from "../utils/constants.js";

/**
 * Main orchestrator workflow that coordinates the scraping process.
 *
 * Flow:
 * 1. Trigger workflow to scrape available terms and subjects
 * 2. Wait for TermsWorkflow to complete
 * 3. Fetch the newly available terms in the database
 * 4. Trigger an orchestrator workflow for each new term
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

    await step.do(
      "trigger-term-orchestrator-workflow",
      defaultConfig,
      async () => {
        const instances = terms.map(term => ({
          params: {
            term: term.value,
            termCode: term.term,
          },
        }));

        const workflows =
          await this.env.TERM_ORCHESTRATOR_WORKFLOW.createBatch(instances);
        const ids = workflows.map(workflow => workflow.id);

        return { triggeredTerms: workflows.length, ids };
      },
    );
  }
}
