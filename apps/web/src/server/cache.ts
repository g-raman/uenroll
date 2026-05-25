import type {
  AvailableCoursesByTermInput,
  CourseByTermAndCodeInput,
  CoursesByFilterInput,
} from ".";

const CACHE_KEY_PREFIX = "db-query:v2";

type CacheEnvelope<T> = {
  value: T;
};

export const DB_QUERY_CACHE_TTL_SECONDS = {
  courseByTermAndCode: 60 * 60,
  availableTerms: 60 * 60 * 24,
  availableCoursesByTerm: 60 * 60 * 24,
  coursesByFilter: 60 * 60 * 8,
} as const;

type DbQueryCacheKeyType =
  | "course-by-term-and-code"
  | "available-terms"
  | "available-courses-by-term"
  | "courses-by-filter";

type CacheOptions<T> = {
  cache: KVNamespace | undefined;
  key: string;
  fetcher: () => Promise<T>;
  ttlSeconds?: number;
};

export function createDbQueryCacheKey(type: "available-terms"): string;
export function createDbQueryCacheKey(
  type: "course-by-term-and-code",
  input: CourseByTermAndCodeInput,
): string;

export function createDbQueryCacheKey(
  type: "available-courses-by-term",
  input: AvailableCoursesByTermInput,
): string;

export function createDbQueryCacheKey(
  type: "courses-by-filter",
  input: CoursesByFilterInput,
): string;

export function createDbQueryCacheKey(
  type: DbQueryCacheKeyType,
  input?:
    | CourseByTermAndCodeInput
    | AvailableCoursesByTermInput
    | CoursesByFilterInput,
): string {
  switch (type) {
    case "available-terms":
      return `${CACHE_KEY_PREFIX}:available-terms`;
    case "course-by-term-and-code": {
      const courseInput = input as CourseByTermAndCodeInput;
      return `${CACHE_KEY_PREFIX}:course-by-term-and-code:${courseInput.term}:${courseInput.courseCode}`;
    }
    case "available-courses-by-term": {
      const availableCoursesInput = input as AvailableCoursesByTermInput;
      return `${CACHE_KEY_PREFIX}:available-courses-by-term:${availableCoursesInput.term}`;
    }
    case "courses-by-filter": {
      const filterInput = input as CoursesByFilterInput;
      return `${CACHE_KEY_PREFIX}:courses-by-filter:${createCoursesByFilterKey(filterInput)}`;
    }
  }
}

export async function getOrSetDbQueryCache<T>({
  cache,
  key,
  fetcher,
  ttlSeconds,
}: CacheOptions<T>): Promise<T> {
  if (!cache) {
    return fetcher();
  }

  try {
    const cached = await cache.get(key);

    if (cached === null) {
      throw new Error("Cache miss");
    }

    const envelope = JSON.parse(cached) as CacheEnvelope<T>;

    if (hasCachedValue(envelope)) {
      return envelope.value;
    }
  } catch {
    // Cache failures should not make read queries unavailable.
  }

  const value = await fetcher();

  try {
    await cache.put(key, JSON.stringify({ value } satisfies CacheEnvelope<T>), {
      expirationTtl: ttlSeconds,
    });
  } catch {
    // Ignore write failures and serve the database result.
  }

  return value;
}

function hasCachedValue<T>(value: unknown): value is CacheEnvelope<T> {
  return typeof value === "object" && value !== null && "value" in value;
}

function createCoursesByFilterKey(input: CoursesByFilterInput): string {
  return [
    `${input.term}`,
    input.subject ? `${input.subject}` : undefined,
    input.year?.length ? `year-${input.year.join("-")}` : undefined,
    input.language?.length ? `${input.language.join("-")}` : undefined,
    input.limit ? `limit-${input.limit}` : undefined,
  ]
    .filter(Boolean)
    .join(":");
}
