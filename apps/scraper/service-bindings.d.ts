interface Env extends Cloudflare.Env {
  HYPERDRIVE: Hyperdrive;
  ORCHESTRATOR_WORKFLOW: Workflow<OrchestratorWorkflow>;
  TERMS_AND_SUBJECTS_SCRAPER_WORKFLOW: Workflow<TermsAndSubjectsScraperWorkflow>;
  TERM_ORCHESTRATOR_WORKFLOW: Workflow<TermOrchestratorWorkflow>;
  SUBJECTS_SCRAPER_WORKFLOW: Workflow<SubjectsScraperWorkflow>;
}
