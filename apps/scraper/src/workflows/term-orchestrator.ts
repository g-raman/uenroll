import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  getAvailableSubjects,
  removeOldSessions,
  removeCoursesWithNoSessions,
} from "@repo/db/queries";
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
 * to process all subjects in batches of 30.
 *
 * Flow:
 * 1. Fetch all subjects from database
 * 2. Split subjects into batches of 30
 * 3. Trigger SubjectBatchWorkflow for each batch
 * 4. Wait for all batches to complete
 * 5. Cleanup old sessions
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

    // Step 2: Split subjects into batches of 30
    const batches: string[][] = [];
    for (let i = 0; i < subjects.length; i += BATCH_SIZE) {
      batches.push(subjects.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `Split into ${batches.length} batches of up to ${BATCH_SIZE} subjects each`,
    );

    // Step 3: Trigger SubjectBatchWorkflow for each batch
    const batchIds = await step.do(
      "trigger-batch-workflows",
      defaultConfig,
      async () => {
        const ids: string[] = [];

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          if (!batch) continue;

          const instance = await this.env.SUBJECT_BATCH_WORKFLOW.create({
            params: {
              term,
              termCode,
              subjects: batch,
            },
          });

          ids.push(instance.id);
          console.log(
            `Triggered batch ${i + 1}/${batches.length}: ${instance.id} with ${batch.length} subjects`,
          );
        }

        return ids;
      },
    );

    // Step 4: Wait for all batch workflows to complete
    for (let i = 0; i < batchIds.length; i++) {
      const batchId = batchIds[i];
      if (!batchId) continue;

      await step.do(
        `wait-for-batch-${i}`,
        {
          retries: {
            limit: 120, // Allow up to 120 retries (60 minutes with 30s delays)
            delay: "30 seconds",
          },
        },
        async () => {
          const instance = await this.env.SUBJECT_BATCH_WORKFLOW.get(batchId);
          const status = await instance.status();

          if (status.status === "running" || status.status === "queued") {
            throw new Error(`Batch ${i + 1} still ${status.status}`);
          }

          if (status.status === "errored") {
            console.error(`Batch ${i + 1} errored: ${status.error}`);
          }

          console.log(`Batch ${i + 1} completed with status: ${status.status}`);
          return { batchId, status: status.status };
        },
      );
    }

    // Step 5: Cleanup old sessions
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
