import { createEnv, StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  },
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnvStrict: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error("❌ Missing/Invalid environment variables:", issues);
    throw new Error("Missing/Invalid environment variables");
  },
});
