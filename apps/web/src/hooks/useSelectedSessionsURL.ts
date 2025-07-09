import { Selected } from "@/types/Types";
import { useQueryState } from "nuqs";
import { parseAsSelectedSessions } from "./utils";

export const useSelectedSessionsURL = () => {
  const selectedSessionsURL = useQueryState<Selected | null>("data", {
    defaultValue: null,
    history: "replace",
    ...parseAsSelectedSessions,
  });

  return selectedSessionsURL;
};
