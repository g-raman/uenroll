import { createDbFromConnectionString, type Database } from "@repo/db";

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
export function createDb(env: Env): Database {
  return createDbFromConnectionString(env.HYPERDRIVE.connectionString, {
    prepare: false,
    max: 5,
  });
}
