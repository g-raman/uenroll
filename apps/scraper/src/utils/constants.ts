import type { WorkflowStepConfig } from "cloudflare:workers";

export const COURSE_REGISTRY_URL: string =
  "https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL";
export const COURSE_CATALOGUE_URL = "https://catalogue.uottawa.ca/en/courses/";

export const FIRST_YEAR = 1;
export const LAST_YEAR = 6;

export const MAX_RETRIES_FOR_ICSID = 5;

export const defaultConfig: WorkflowStepConfig = {
  retries: {
    limit: 3,
    delay: "10 seconds",
    backoff: "exponential",
  },
};

export const SCRAPING_RETRY_CONFIG: WorkflowStepConfig = {
  retries: { limit: 4, delay: "3 seconds", backoff: "linear" },
};

export const COURSE_COMPONENTS = [
  "ADM",
  "TST",
  "DGD",
  "LAB",
  "LEC",
  "MTR",
  "PRA",
  "REC",
  "SEM",
  "TLB",
  "TUT",
  "STG",
];
