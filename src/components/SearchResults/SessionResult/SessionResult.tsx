import { Session } from "@/types/Types";
import moment from "moment";
import React from "react";

interface SessionResultProps {
  session: Session;
}
export const SessionResult: React.FC<SessionResultProps> = ({ session }) => {
  const startTime = moment(`${session.startDate}T${session.startTime}`).format("LT");
  const endTime = moment(`${session.endDate}T${session.endTime}`).format("LT");
  const startDate = moment(session.startDate).format("ll");
  const endDate = moment(session.endDate).format("ll");
  return (
    <ul>
      <li>
        <div>
          <span className="truncate font-medium">{session.instructor}</span>
          <br />
          <span className="font-semibold">{session.dayOfWeek}</span>
          &nbsp;
          <span className="truncate font-normal text-slate-600">{`${startTime} - ${endTime}`}</span>
          <br />
          <span className="truncate text-gray-400">{`${startDate} to ${endDate}`}</span>
        </div>
      </li>
    </ul>
  );
};
