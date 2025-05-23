import { removeCoursesWithNoSessions, removeOldSessions } from "./supabase.js";
import { client } from "@repo/db";

const REMOVE_BEFORE_TIME = 5 * 60 * 60 * 1000;
await removeOldSessions(REMOVE_BEFORE_TIME);
await removeCoursesWithNoSessions();

await client.end();
