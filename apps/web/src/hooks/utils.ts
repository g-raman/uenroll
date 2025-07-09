import { createParser } from "nuqs";
import LZString from "lz-string";

export const parseAsSelectedSessions = createParser({
  parse: value => JSON.parse(LZString.decompressFromBase64(value)),
  serialize: value => LZString.compressToBase64(JSON.stringify(value)),
});
