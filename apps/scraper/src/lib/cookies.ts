import * as cheerio from "cheerio";
import { err, Result, ResultAsync } from "neverthrow";
import { COURSE_REGISTRY_URL } from "../utils/constants.js";

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

    console.log(`[${redirectCount}] Fetching: ${url}`);
    console.log(
      `[${redirectCount}] Sending cookies: ${existingCookies || "(none)"}`,
    );

    // Make the request - disable automatic redirects so we can handle cookies
    const response = await fetch(url, {
      ...init,
      headers,
      redirect: "manual",
    });

    // Extract cookies from the response
    cookieJar.extractFromResponse(response);
    console.log(
      `[${redirectCount}] Received cookies: ${cookieJar.getCookieHeader()}`,
    );
    console.log(`[${redirectCount}] Response status: ${response.status}`);

    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (location) {
        // Resolve relative URLs
        const redirectUrl = new URL(location, url).toString();
        console.log(`[${redirectCount}] Redirecting to: ${redirectUrl}`);

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
