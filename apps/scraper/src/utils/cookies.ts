import * as cheerio from "cheerio";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { COURSE_REGISTRY_URL } from "./constants.js";

/**
 * Serializable session data that can be passed between workflow steps.
 */
export interface SessionData {
  icsid: string;
  cookies: Record<string, string>;
}

const MAX_RETRIES_FOR_SESSION = 8;

/**
 * Cookie jar for maintaining session state across requests.
 */
class CookieJar {
  private cookies: Map<string, string> = new Map();

  extractFromResponse(response: Response): void {
    const setCookieHeaders = response.headers.getSetCookie();

    for (const cookieHeader of setCookieHeaders) {
      const [cookiePart] = cookieHeader.split(";");
      if (cookiePart) {
        const [name, ...valueParts] = cookiePart.split("=");
        const value = valueParts.join("=");

        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      }
    }
  }

  getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  hasCookies(): boolean {
    return this.cookies.size > 0;
  }

  clear(): void {
    this.cookies.clear();
  }

  toObject(): Record<string, string> {
    return Object.fromEntries(this.cookies.entries());
  }

  static fromObject(cookies: Record<string, string>): CookieJar {
    const jar = new CookieJar();
    for (const [name, value] of Object.entries(cookies)) {
      jar.cookies.set(name, value);
    }
    return jar;
  }
}

/**
 * Creates a fetch function that maintains cookies across requests.
 */
export function createFetchWithCookies() {
  const cookieJar = new CookieJar();

  const doFetch = async (
    url: string,
    init?: RequestInit,
    redirectCount = 0,
  ): Promise<Response> => {
    if (redirectCount > 10) {
      throw new Error("Too many redirects");
    }

    const headers = new Headers(init?.headers);

    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    headers.set(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    );
    headers.set("Accept-Language", "en-US,en;q=0.9");
    headers.set("Cache-Control", "no-cache");

    const existingCookies = cookieJar.getCookieHeader();
    if (existingCookies) {
      headers.set("Cookie", existingCookies);
    }

    // Make the request - disable automatic redirects so we can handle cookies
    const response = await fetch(url, {
      ...init,
      headers,
      redirect: "manual",
    });

    // Extract cookies from the response
    cookieJar.extractFromResponse(response);

    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (location) {
        await response.body?.cancel();
        // Resolve relative URLs
        const redirectUrl = new URL(location, url).toString();

        // For 303 or POST->GET redirect, change method to GET
        const newInit = { ...init };
        if (
          response.status === 303 ||
          (response.status === 302 && init?.method === "POST")
        ) {
          newInit.method = "GET";
          newInit.body = undefined;
        }

        return doFetch(redirectUrl, newInit, redirectCount + 1);
      }
    }

    return response;
  };

  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    return doFetch(url, init);
  };
}

/**
 * Get ICSID token from the course registry page.
 * Uses the provided fetch function (should be cookie-aware).
 */
export async function getICSID(
  fetchFn: typeof fetch,
): Promise<Result<string | undefined, Error>> {
  const initialResponse = await ResultAsync.fromPromise(
    fetchFn(COURSE_REGISTRY_URL, {
      method: "GET",
    }),
    error => new Error(`Failed to fetch course registry HTML: ${error}`),
  );

  if (initialResponse.isErr()) {
    return err(initialResponse.error);
  }

  const initialHtml = await ResultAsync.fromPromise(
    initialResponse.value.text(),
    error => new Error(`Failed to parse HTML response: ${error}`),
  );

  if (initialHtml.isErr()) {
    return err(initialHtml.error);
  }

  const icsid = Result.fromThrowable(
    () => {
      const $ = cheerio.load(initialHtml.value);
      return $("input[name=ICSID]").attr("value");
    },
    error => new Error(`Failed to get ICSID: ${error}`),
  )();

  return icsid;
}

/**
 * Get a complete session (ICSID + cookies) with retry logic.
 * This creates a fresh session that can be serialized and passed to workflow steps.
 */
export async function getSession(): Promise<Result<SessionData, Error>> {
  let counter = 1;

  while (counter <= MAX_RETRIES_FOR_SESSION) {
    const cookieJar = new CookieJar();

    // Make initial request to get cookies
    const headers = new Headers();
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    headers.set(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    );
    headers.set("Accept-Language", "en-US,en;q=0.9");
    headers.set("Cache-Control", "no-cache");

    try {
      const response = await fetch(COURSE_REGISTRY_URL, {
        method: "GET",
        headers,
        redirect: "manual",
      });

      cookieJar.extractFromResponse(response);
      let html = await response.text();

      // Handle redirects manually to collect all cookies
      let currentResponse = response;
      let redirectCount = 0;

      while (
        currentResponse.status >= 300 &&
        currentResponse.status < 400 &&
        redirectCount < 10
      ) {
        const location = currentResponse.headers.get("Location");
        if (!location) break;

        const redirectUrl = new URL(location, COURSE_REGISTRY_URL).toString();
        const redirectHeaders = new Headers(headers);
        const existingCookies = cookieJar.getCookieHeader();
        if (existingCookies) {
          redirectHeaders.set("Cookie", existingCookies);
        }

        currentResponse = await fetch(redirectUrl, {
          method: "GET",
          headers: redirectHeaders,
          redirect: "manual",
        });

        cookieJar.extractFromResponse(currentResponse);
        html = await currentResponse.text();
        redirectCount++;
      }

      const $ = cheerio.load(html);
      const icsid = $("input[name=ICSID]").attr("value");

      if (icsid && cookieJar.hasCookies()) {
        return ok({
          icsid,
          cookies: cookieJar.toObject(),
        });
      }

      console.log(`Session attempt ${counter}: ICSID not found, retrying...`);
    } catch (error) {
      console.log(`Session attempt ${counter} failed: ${error}`);
    }

    counter++;
  }

  return err(new Error("Failed to get session after max retries"));
}
