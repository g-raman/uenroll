import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env["DATABASE_URL"] as string;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema, casing: "snake_case" });
