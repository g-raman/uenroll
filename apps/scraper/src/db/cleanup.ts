import { removeCoursesWithNoSessions, removeOldSessions } from "../supabase.ts";

const REMOVE_BEFORE_TIME = 5 * 60 * 60 * 1000;
await removeOldSessions(REMOVE_BEFORE_TIME);
await removeCoursesWithNoSessions();
