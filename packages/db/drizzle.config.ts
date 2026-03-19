import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import { env } from "@repo/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
