import { createParser } from "nuqs";
import { Result } from "neverthrow";
import lzString from "lz-string";

const { decompressFromBase64 } = lzString;

export const parseAsSelectedSessions = createParser({
  parse: value => {
    const result = Result.fromThrowable(
      () => JSON.parse(atob(decodeURI(value))),
      error => new Error(`Failed to parse url data: ${error}`),
    )();

    if (result.isOk()) {
      return result.value;
    }
    console.error(result.error);

    const oldCompressionResult = Result.fromThrowable(
      () => JSON.parse(decompressFromBase64(value)),
      error => new Error(`Failed to parse url data: ${error}`),
    )();

    if (oldCompressionResult.isErr()) {
      console.error(oldCompressionResult.error);
      return {};
    }
    return oldCompressionResult.value;
  },
  serialize: value => encodeURI(btoa(JSON.stringify(value))),
});
