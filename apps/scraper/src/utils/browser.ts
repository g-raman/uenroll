import puppeteer, { Browser } from "puppeteer-core";
import "dotenv/config";

export const getBrowserEndpoint = async (): Promise<string> => {
  const res = await fetch("http://localhost:9222/json/version");
  const data = await res.json();
  const browserEndpoint = data.webSocketDebuggerUrl as string;

  return browserEndpoint;
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
