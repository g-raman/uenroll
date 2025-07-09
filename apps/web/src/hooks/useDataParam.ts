import { Selected } from "@/types/Types";
import { useQueryState } from "nuqs";
import { parseAsSelectedSessions } from "./utils";

export const useDataParam = () => {
  const [data, setData] = useQueryState<Selected | null>("data", {
    defaultValue: null,
    history: "replace",
    ...parseAsSelectedSessions,
  });

  return [data, setData] as const;
};
