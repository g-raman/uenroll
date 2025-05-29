import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { env } from "@repo/env/server";

export const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema, casing: "snake_case" });
