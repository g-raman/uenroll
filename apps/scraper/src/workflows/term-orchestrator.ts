import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { getAvailableSubjects } from "@repo/db/queries";
import { createDb } from "../utils/db.js";
import { defaultConfig } from "../utils/constants.js";

export interface TermOrchestratorWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
}

const BATCH_SIZE = 15;

/**
 * Workflow to scrape all subjects for a specific term.
 *
 * This workflow is triggered once per term and orchestrates batch workflows
 * to process all subjects in batches.
 *
 * Flow:
 * 1. Fetch all subjects from database
 * 2. Split subjects into batches for parallelization
 * 3. Trigger workflow for each batch
 *
 * Note: The parent orchestrator workflow waits for completion and handles cleanup.
 */
export class TermOrchestratorWorkflow extends WorkflowEntrypoint<
  Env,
  TermOrchestratorWorkflowParams
> {
  override async run(
    event: WorkflowEvent<TermOrchestratorWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { term, termCode } = event.payload;

    const subjects = await step.do("get-subjects", defaultConfig, async () => {
      const db = createDb(this.env);
      const result = await getAvailableSubjects(db);

      if (result.isErr()) {
        throw new Error(`Failed to fetch subjects: ${result.error.message}`);
      }

      return result.value;
    });

    const batches: string[][] = [];
    for (let i = 0; i < subjects.length; i += BATCH_SIZE) {
      batches.push(subjects.slice(i, i + BATCH_SIZE));
    }

    const batchWorkflowIds = await step.do(
      "trigger-batch-workflows",
      defaultConfig,
      async () => {
        const ids: string[] = [];

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          if (!batch) continue;

          const instance = await this.env.SUBJECTS_SCRAPER_WORKFLOW.create({
            params: {
              term,
              termCode,
              subjects: batch,
            },
          });

          console.log(
            `Triggered batch ${i + 1}/${batches.length}: ${instance.id} with ${batch.length} subjects`,
          );

          ids.push(instance.id);
        }

        return ids;
      },
    );

    for (let i = 0; i < batchWorkflowIds.length; i++) {
      const workflowId = batchWorkflowIds[i];
      if (!workflowId) continue;

      await step.do(
        `wait-for-batch-${i}`,
        // Allow up to 10 retries (20 minutes max per batch)
        { retries: { limit: 10, delay: "2 minutes", backoff: "constant" } },
        async () => {
          const instance =
            await this.env.SUBJECTS_SCRAPER_WORKFLOW.get(workflowId);
          const status = await instance.status();

          if (status.status === "running" || status.status === "queued") {
            throw new Error(`Batch workflow ${i + 1} still ${status.status}`);
          }

          if (status.status === "errored") {
            console.error(`Batch workflow ${i + 1} errored: ${status.error}`);
          }

          return { workflowId, status: status.status };
        },
      );
    }
  }
}
