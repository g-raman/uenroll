import {
  removeCoursesWithNoSessions,
  removeOldSessions,
} from "@repo/db/queries";

const REMOVE_BEFORE_TIME = 5 * 60 * 60 * 1000;

const resultRemoveOldSessions = await removeOldSessions(REMOVE_BEFORE_TIME);
if (resultRemoveOldSessions.isErr()) {
  console.error(resultRemoveOldSessions.error);
}

const resultRemoveCoursesWithNoSessions = await removeCoursesWithNoSessions();
if (resultRemoveCoursesWithNoSessions.isErr()) {
  console.error(resultRemoveCoursesWithNoSessions.error);
}
