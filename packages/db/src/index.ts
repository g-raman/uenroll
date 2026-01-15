import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { env } from "@repo/env/server";

export const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema, casing: "snake_case" });
export type Database = typeof db;
export { sql } from "drizzle-orm";

/**
 * Creates a new database client from a connection string.
 * Useful for environments like Cloudflare Workers where you need
 * to create a new client per request.
 *
 * @param connectionString - PostgreSQL connection string
 * @param options - Optional postgres.js options
 */
export function createDbFromConnectionString(
  connectionString: string,
  options?: { prepare?: boolean; max?: number },
) {
  const client = postgres(connectionString, {
    prepare: options?.prepare ?? false,
    max: options?.max ?? 5,
  });
  return drizzle(client, { schema, casing: "snake_case" });
}
