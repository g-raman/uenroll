import puppeteer, { Browser } from "puppeteer-core";
import "dotenv/config";
import { errAsync, okAsync, Result, ResultAsync } from "neverthrow";

interface DebuggerVersionResponse {
  webSocketDebuggerUrl: string;
}

export const getBrowserEndpoint = async (): Promise<Result<string, Error>> => {
  return ResultAsync.fromPromise(
    fetch("http://localhost:9222/json/version"),
    error => new Error(`Fetch for browser endpoint failed: ${error}`),
  )
    .andThen(res =>
      res.ok
        ? ResultAsync.fromPromise(
            res.json() as Promise<DebuggerVersionResponse>,
            error =>
              new Error(`JSON parse for browser endpoint failed: ${error}`),
          )
        : errAsync(new Error(`HTTP error ${res.status}: ${res.statusText}`)),
    )
    .andThen(data =>
      data.webSocketDebuggerUrl
        ? okAsync(data.webSocketDebuggerUrl)
        : errAsync(new Error(`Couldn't find browser endpoint`)),
    );
};

export const getBrowser = async (browserEndpoint: string): Promise<Browser> => {
  const environment = process.env["ENVIRONMENT"];
  const puppeteerExecutablePath = process.env["PUPPETEER_EXECUTABLE_PATH"];

  if (environment === "DEV") {
    return await puppeteer.launch({
      executablePath: puppeteerExecutablePath,
      headless: false,
    });
  }
  return await puppeteer.connect({ browserWSEndpoint: browserEndpoint });
};
