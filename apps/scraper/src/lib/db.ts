import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@repo/db/schema";
import type { Env } from "./types.js";

// Re-export everything from @repo/db
export * from "@repo/db/schema";
export * from "@repo/db/types";
export * from "@repo/db/queries";
export type { Database } from "@repo/db";

/**
 * Creates a new database client for each request using Hyperdrive.
 * IMPORTANT: In Cloudflare Workers, you must create a new client per request.
 * Reusing connections across requests is not allowed.
 *
 * Usage:
 * ```
 * const db = createDb(env);
 * const terms = await getAvailableTerms(db);
 * ```
 */
export function createDb(env: Env) {
  const client = postgres(env.HYPERDRIVE.connectionString, {
    prepare: false,
    max: 5, // Limit connections per Worker
  });
  return drizzle(client, { schema, casing: "snake_case" });
}
