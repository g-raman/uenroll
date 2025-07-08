import LZString from "lz-string";
import { useQueryState } from "nuqs";

export const useSelectedSessionsURL = () => {
  const selectedSessionsURL = useQueryState("data", {
    defaultValue: {},
    history: "replace",
    parse: value => JSON.parse(LZString.decompressFromBase64(value)),
    serialize: value => LZString.compressToBase64(JSON.stringify(value)),
  });

  return selectedSessionsURL;
};
