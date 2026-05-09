import { createDbFromConnectionString, type Database } from "@repo/db";

/**
 * Creates a new database client for each request using Hyperdrive.
 * Cloudflare Workers must not reuse postgres clients across requests.
 */
export function createDb(env: Env): Database {
  return createDbFromConnectionString(env.HYPERDRIVE.connectionString, {
    prepare: false,
    max: 5,
  });
}
