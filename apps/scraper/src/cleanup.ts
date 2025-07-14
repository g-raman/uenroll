import {
  removeCoursesWithNoSessions,
  removeOldSessions,
} from "@repo/db/queries";
import { logger } from "./utils/logger.js";

const REMOVE_BEFORE_TIME = 5 * 60 * 60 * 1000;

const resultRemoveOldSessions = await removeOldSessions(REMOVE_BEFORE_TIME);
if (resultRemoveOldSessions.isErr()) {
  logger.error(resultRemoveOldSessions.error);
}

const resultRemoveCoursesWithNoSessions = await removeCoursesWithNoSessions();
if (resultRemoveCoursesWithNoSessions.isErr()) {
  logger.error(resultRemoveCoursesWithNoSessions.error);
}
