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
 * 1. Trigger TermsWorkflow to scrape available terms and subjects
 * 2. Wait for TermsWorkflow to complete
 * 3. Fetch available terms from the database
 * 4. Trigger SubjectsWorkflow for each term (in parallel)
 */
export class MainWorkflow extends WorkflowEntrypoint<Env, void> {
  override async run(_: WorkflowEvent<void>, step: WorkflowStep) {
    // Step 1: Trigger terms scraping workflow
    const termsInstance = await step.do("trigger-terms-workflow", async () => {
      const instance = await this.env.TERMS_WORKFLOW.create();
      return { id: instance.id };
    });

    console.log(`Triggered terms workflow: ${termsInstance.id}`);

    // Step 2: Poll until terms workflow completes
    // Using retries to poll - each retry waits 30 seconds
    await step.do(
      "wait-for-terms",
      {
        retries: {
          limit: 30, // Max 5 minutes of waiting
          delay: "10 seconds",
          backoff: "constant",
        },
      },
      async () => {
        const instance = await this.env.TERMS_WORKFLOW.get(termsInstance.id);
        const status = await instance.status();

        if (status.status === "errored") {
          throw new Error(`Terms workflow errored: ${JSON.stringify(status)}`);
        }

        if (status.status !== "complete") {
          throw new Error(`Terms workflow still ${status.status}`);
        }

        console.log("Terms workflow completed successfully");
        return { status: status.status };
      },
    );

    // Step 3: Get available terms from database
    const terms = await step.do("fetch-terms", async () => {
      const db = createDb(this.env);
      const result = await getAvailableTerms(db);

      if (result.isErr()) {
        throw new Error(`Failed to fetch terms: ${result.error.message}`);
      }

      return result.value;
    });

    console.log(`Found ${terms.length} terms to process`);

    // Step 4: Trigger subject workflows for each term (using batch for efficiency)
    await step.do("trigger-subject-workflows", defaultConfig, async () => {
      const instances = terms.map(term => ({
        params: {
          term: term.value,
          termCode: term.term,
        },
      }));

      const workflows = await this.env.SUBJECTS_WORKFLOW.createBatch(instances);
      const ids = workflows.map(workflow => workflow.id);

      console.log(`Triggered ${instances.length} subject workflows`);
      return { triggeredTerms: workflows.length, ids };
    });

    console.log(
      "Main workflow completed - subject workflows running in parallel",
    );
  }
}
