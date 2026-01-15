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
