import { createEnv, StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

const LOCAL_POSTGRES = "postgresql://postgres:postgres@localhost:5432/postgres";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().default(LOCAL_POSTGRES),
  },
  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  onValidationError: (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error("❌ Missing/Invalid environment variables:", issues);
    throw new Error("Missing/Invalid environment variables");
  },
});
