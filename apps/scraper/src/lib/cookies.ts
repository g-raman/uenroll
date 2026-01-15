import * as cheerio from "cheerio";
import { err, Result, ResultAsync } from "neverthrow";

const COURSE_REGISTRY_URL =
  "https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL";

/**
 * Cookie jar for maintaining session state across requests.
 * In Workers, we can't use fetch-cookie, so we manage cookies manually.
 */
class CookieJar {
  private cookies: Map<string, string> = new Map();

  /**
   * Extract cookies from a response and store them
   */
  extractFromResponse(response: Response): void {
    // Cloudflare Workers supports getSetCookie()
    // Cast to access the method which exists at runtime but may not be in TS types
    const setCookieHeaders = (
      response.headers as Headers & { getSetCookie(): string[] }
    ).getSetCookie();

    for (const cookieHeader of setCookieHeaders) {
      const [cookiePart] = cookieHeader.split(";");
      if (cookiePart) {
        const [name, ...valueParts] = cookiePart.split("=");
        const value = valueParts.join("="); // Handle values that contain =
        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      }
    }
  }

  /**
   * Get the Cookie header value for requests
   */
  getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /**
   * Check if we have any cookies
   */
  hasCookies(): boolean {
    return this.cookies.size > 0;
  }

  /**
   * Clear all cookies
   */
  clear(): void {
    this.cookies.clear();
  }
}

/**
 * Creates a fetch function that maintains cookies across requests.
 * Similar to fetch-cookie but works in Cloudflare Workers.
 *
 * Key difference from native fetch: handles redirects manually to maintain cookies.
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

    // Build headers properly
    const headers = new Headers(init?.headers);

    // Add default headers
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36",
    );
    headers.set(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    );
    headers.set("Accept-Language", "en-US,en;q=0.9");
    headers.set("Cache-Control", "no-cache");

    // Add cookies from the jar
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
      redirect: "manual", // Handle redirects manually to maintain cookies
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

export { COURSE_REGISTRY_URL };
