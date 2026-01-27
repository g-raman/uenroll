export { OrchestratorWorkflow } from "./workflows/orchestrator.js";
export { TermsAndSubjectsScraperWorkflow } from "./workflows/terms-and-subjects-scraper.js";
export { TermOrchestratorWorkflow } from "./workflows/term-orchestrator.js";
export { SubjectsScraperWorkflow } from "./workflows/subjects-scraper.js";

export default {
  async fetch(): Promise<Response> {
    return Response.json(null, { status: 204 });
  },

  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    const startTime = new Date(controller.scheduledTime).toISOString();

    console.log(`Cron triggered at ${startTime}`);

    try {
      const instance = await env.ORCHESTRATOR_WORKFLOW.create();
      console.log(`Triggered main workflow: ${instance.id}`);
    } catch (error) {
      console.error(
        `Failed to trigger workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
};
