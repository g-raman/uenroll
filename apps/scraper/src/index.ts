export { MainWorkflow } from "./workflows/main.js";
export { TermsWorkflow } from "./workflows/terms.js";
export { SubjectsWorkflow } from "./workflows/subjects.js";

export default {
  /**
   * HTTP handler for manual triggers and status checks.
   *
   * Endpoints:
   * - GET / - Health check
   * - POST /trigger - Trigger main workflow
   * - GET /status?id=<workflow-id> - Check workflow status
   * - POST /trigger/terms - Trigger terms workflow only
   * - POST /trigger/subjects?term=<term>&termCode=<code> - Trigger subjects workflow
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        message: "uenroll scraper",
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    }

    // Trigger main workflow
    if (url.pathname === "/trigger" && request.method === "POST") {
      try {
        const instance = await env.MAIN_WORKFLOW.create({
          id: `manual-${Date.now()}`,
        });
        return Response.json({
          id: instance.id,
          status: "triggered",
          message: "Main workflow triggered successfully",
        });
      } catch (error) {
        return Response.json(
          {
            error: "Failed to trigger workflow",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Trigger terms workflow only
    if (url.pathname === "/trigger/terms" && request.method === "POST") {
      try {
        const instance = await env.TERMS_WORKFLOW.create({
          id: `manual-terms-${Date.now()}`,
        });
        return Response.json({
          id: instance.id,
          status: "triggered",
          message: "Terms workflow triggered successfully",
        });
      } catch (error) {
        return Response.json(
          {
            error: "Failed to trigger terms workflow",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Trigger subjects workflow for a specific term
    if (url.pathname === "/trigger/subjects" && request.method === "POST") {
      const term = url.searchParams.get("term");
      const termCode = url.searchParams.get("termCode");

      if (!term || !termCode) {
        return Response.json(
          {
            error: "Missing required parameters",
            required: ["term", "termCode"],
            example: "/trigger/subjects?term=2025%20Fall%20Term&termCode=2259",
          },
          { status: 400 },
        );
      }

      try {
        const instance = await env.SUBJECTS_WORKFLOW.create({
          id: `manual-subjects-${term.replace(/\s+/g, "-")}-${Date.now()}`,
          params: { term, termCode },
        });
        return Response.json({
          id: instance.id,
          status: "triggered",
          message: `Subjects workflow triggered for ${term}`,
        });
      } catch (error) {
        return Response.json(
          {
            error: "Failed to trigger subjects workflow",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // Check workflow status
    if (url.pathname === "/status" && request.method === "GET") {
      const id = url.searchParams.get("id");
      const type = url.searchParams.get("type") || "main";

      if (!id) {
        return Response.json(
          {
            error: "Missing id parameter",
            usage: "/status?id=<workflow-id>&type=<main|terms|subjects>",
          },
          { status: 400 },
        );
      }

      try {
        let instance;
        switch (type) {
          case "terms":
            instance = await env.TERMS_WORKFLOW.get(id);
            break;
          case "subjects":
            instance = await env.SUBJECTS_WORKFLOW.get(id);
            break;
          default:
            instance = await env.MAIN_WORKFLOW.get(id);
        }

        const status = await instance.status();
        return Response.json({
          id,
          type,
          ...status,
        });
      } catch (error) {
        return Response.json(
          {
            error: "Failed to get workflow status",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    }

    // 404 for unknown routes
    return Response.json(
      {
        error: "Not found",
        availableEndpoints: [
          "GET / - Health check",
          "POST /trigger - Trigger main workflow",
          "POST /trigger/terms - Trigger terms workflow",
          "POST /trigger/subjects?term=<term>&termCode=<code> - Trigger subjects workflow",
          "GET /status?id=<id>&type=<main|terms|subjects> - Check workflow status",
        ],
      },
      { status: 404 },
    );
  },

  /**
   * Cron handler - triggered by the scheduled cron job.
   * This triggers the main workflow which orchestrates the entire scraping process.
   */
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    const startTime = new Date(controller.scheduledTime).toISOString();

    console.log(`Cron triggered at ${startTime}`);

    try {
      const instance = await env.MAIN_WORKFLOW.create();
      console.log(`Triggered main workflow: ${instance.id}`);
    } catch (error) {
      console.error(
        `Failed to trigger workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
};
