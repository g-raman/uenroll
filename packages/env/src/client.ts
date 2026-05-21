import { createEnv, StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

export const envClient = createEnv({
  client: {
    VITE_BASE_URL: z.string().url().default("http://localhost:3000"),
    VITE_POSTHOG_KEY: z.string(),
    VITE_POSTHOG_HOST: z.string().url(),
  },
  clientPrefix: "VITE_",
  runtimeEnvStrict: {
    VITE_BASE_URL: process.env.VITE_BASE_URL,
    VITE_POSTHOG_KEY: process.env.VITE_POSTHOG_KEY,
    VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST,
  },
  onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error("❌ Missing/Invalid environment variables:", issues);
    throw new Error("Missing/Invalid environment variables");
  },
});
