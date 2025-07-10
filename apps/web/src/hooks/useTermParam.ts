import { parseAsString, useQueryState } from "nuqs";

export const useTermParam = () => {
  return useQueryState("term", {
    ...parseAsString.withDefault(""),
    history: "replace",
  });
};
