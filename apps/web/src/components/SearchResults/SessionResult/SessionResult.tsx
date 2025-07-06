import { Session } from "@repo/db/types";
import moment from "moment";
import React from "react";

interface SessionResultProps {
  session: Session;
}
export const SessionResult: React.FC<SessionResultProps> = ({ session }) => {
  const isVirtual = session.dayOfWeek === "N/A";
  const startTime = moment(`${session.startDate}T${session.startTime}`).format(
    "LT",
  );
  const endTime = moment(`${session.endDate}T${session.endTime}`).format("LT");
  const startDate = moment(session.startDate).format("ll");
  const endDate = moment(session.endDate).format("ll");

  // HACK: Ignore dates that have this as their timing
  const isUnknownDate = session.startDate === "1901-12-14";
  return (
    <ul>
      <li>
        <div>
          <span className="truncate font-medium">{session.instructor}</span>
          <br />
          {isVirtual ? (
            <p className="font-semibold">Virtual</p>
          ) : (
            <>
              <span className="font-semibold">{session.dayOfWeek}</span>
              &nbsp;
              <span className="truncate font-normal text-slate-600 dark:text-slate-400">{`${startTime} - ${endTime}`}</span>
              <br />
            </>
          )}
          <span className="truncate text-gray-400">
            {isUnknownDate ? "Unknown" : `${startDate} to ${endDate}`}
          </span>
        </div>
      </li>
    </ul>
  );
};
