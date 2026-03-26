import { createEnv, StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
  },
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnvStrict: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error("❌ Missing/Invalid environment variables:", issues);
    throw new Error("Missing/Invalid environment variables");
  },
});
