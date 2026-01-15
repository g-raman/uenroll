export interface Env {
  // Hyperdrive binding for database connection
  HYPERDRIVE: Hyperdrive;

  // Workflow bindings
  MAIN_WORKFLOW: Workflow;
  TERMS_WORKFLOW: Workflow;
  SUBJECTS_WORKFLOW: Workflow;

  // Environment variables
  COURSE_REGISTRY_URL: string;
  COURSE_CATALOGUE_URL: string;
}

export interface SubjectsWorkflowParams {
  term: string; // e.g., "2025 Fall Term"
  termCode: string; // e.g., "2259"
}

export interface TermData {
  term: string;
  value: string;
}

export interface SubjectData {
  subject: string;
}

export interface WorkflowInstanceInfo {
  id: string;
}

// Re-export types that will be needed across the codebase
export type {
  CourseDetailsInsert,
  CourseInsert,
  CourseComponentInsert,
  SessionInsert,
  TermInsert,
  SubjectInsert,
  Term,
} from "@repo/db/types";
