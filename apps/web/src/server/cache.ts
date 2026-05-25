import type {
  AvailableCoursesByTermInput,
  CourseByTermAndCodeInput,
  CoursesByFilterInput,
} from "./inputSchemas";

const CACHE_KEY_PREFIX = "db-query:v2";

type CacheEnvelope<T> = {
  value: T;
};

export const DB_QUERY_CACHE_TTL_SECONDS = {
  courseByTermAndCode: 60 * 60,
  availableTerms: 60 * 60 * 24,
  availableCoursesByTerm: 60 * 60 * 24,
  coursesByFilter: 60 * 60,
} as const;

type DbQueryCacheKeyArgs = {
  "available-terms": [];
  "course-by-term-and-code": [CourseByTermAndCodeInput];
  "available-courses-by-term": [AvailableCoursesByTermInput];
  "courses-by-filter": [CoursesByFilterInput];
};

type DbQueryCacheKeyType = keyof DbQueryCacheKeyArgs;

type CacheOptions<T> = {
  cache: KVNamespace | undefined;
  key: string;
  fetcher: () => Promise<T>;
  ttlSeconds?: number;
};

const cacheKeyBuilders = {
  "available-terms": () => `${CACHE_KEY_PREFIX}:available-terms`,
  "course-by-term-and-code": (input: CourseByTermAndCodeInput) =>
    `${CACHE_KEY_PREFIX}:course-by-term-and-code:${input.term}:${input.courseCode}`,
  "available-courses-by-term": (input: AvailableCoursesByTermInput) =>
    `${CACHE_KEY_PREFIX}:available-courses-by-term:${input.term}`,
  "courses-by-filter": (input: CoursesByFilterInput) =>
    `${CACHE_KEY_PREFIX}:courses-by-filter:${createCoursesByFilterKey(input)}`,
} satisfies {
  [KeyType in DbQueryCacheKeyType]: (
    ...args: DbQueryCacheKeyArgs[KeyType]
  ) => string;
};

export function createDbQueryCacheKey<KeyType extends DbQueryCacheKeyType>(
  type: KeyType,
  ...args: DbQueryCacheKeyArgs[KeyType]
): string {
  const createKey = cacheKeyBuilders[type] as (
    ...args: DbQueryCacheKeyArgs[KeyType]
  ) => string;

  return createKey(...args);
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
    const cached = await readDbQueryCache<T>(cache, key);

    if (cached.hit) {
      return cached.value;
    }
  } catch {
    // Cache failures should not make read queries unavailable.
  }

  const value = await fetcher();

  try {
    await writeDbQueryCache(cache, key, value, ttlSeconds);
  } catch {
    // Ignore write failures and serve the database result.
  }

  return value;
}

async function readDbQueryCache<T>(
  cache: KVNamespace,
  key: string,
): Promise<{ hit: true; value: T } | { hit: false }> {
  const cached = await cache.get(key);

  if (cached === null) {
    return { hit: false };
  }

  const parsed = JSON.parse(cached) as unknown;

  if (!hasCachedValue<T>(parsed)) {
    return { hit: false };
  }

  return { hit: true, value: parsed.value };
}

async function writeDbQueryCache<T>(
  cache: KVNamespace,
  key: string,
  value: T,
  ttlSeconds: number | undefined,
): Promise<void> {
  await cache.put(key, JSON.stringify({ value } satisfies CacheEnvelope<T>), {
    expirationTtl: ttlSeconds,
  });
}

function hasCachedValue<T>(value: unknown): value is CacheEnvelope<T> {
  return typeof value === "object" && value !== null && "value" in value;
}

function createCoursesByFilterKey(input: CoursesByFilterInput): string {
  return [
    input.term,
    input.subject ? `subject-${input.subject}` : undefined,
    input.year?.length ? `year-${input.year.join("-")}` : undefined,
    input.language?.length ? `language-${input.language.join("-")}` : undefined,
    input.limit ? `limit-${input.limit}` : undefined,
  ]
    .filter(Boolean)
    .join(":");
}
