import puppeteer, { Browser } from "puppeteer-core";
import "dotenv/config";

interface DebuggerVersionResponse {
  webSocketDebuggerUrl: string;
}

export const getBrowserEndpoint = async (): Promise<string> => {
  const res = await fetch("http://localhost:9222/json/version");
  const data = (await res.json()) as DebuggerVersionResponse;
  const browserEndpoint = data.webSocketDebuggerUrl as string;

  return browserEndpoint;
};

export const getBrowser = async (browserEndpoint: string): Promise<Browser> => {
  /*
   * TODO: Temporary disabling as I need to write documentation for a proper setup
   */

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const environment = process.env["ENVIRONMENT"];
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const puppeteerExecutablePath = process.env["PUPPETEER_EXECUTABLE_PATH"];

  if (environment === "DEV") {
    return await puppeteer.launch({
      executablePath: puppeteerExecutablePath,
      headless: false,
    });
  }
  return await puppeteer.connect({ browserWSEndpoint: browserEndpoint });
};
