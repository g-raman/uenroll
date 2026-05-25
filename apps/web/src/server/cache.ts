const CACHE_KEY_PREFIX = "db-query:v1";

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

export function createDbQueryCacheKey(
  type: DbQueryCacheKeyType,
  input?: unknown,
): string {
  if (input === undefined || input === null) {
    return `${CACHE_KEY_PREFIX}:${type}`;
  }

  return `${CACHE_KEY_PREFIX}:${type}:${stableStringify(input)}`;
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
    const cached = await cache.get<T>(key, { type: "json" });

    if (cached !== null) {
      return cached;
    }
  } catch {
    // Cache failures should not make read queries unavailable.
  }

  const value = await fetcher();

  try {
    await cache.put(key, JSON.stringify(value), {
      expirationTtl: ttlSeconds,
    });
  } catch {
    // Ignore write failures and serve the database result.
  }

  return value;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(stableStringify).join("-");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${key}-${stableStringify(entry)}`)
      .join(":");
  }

  return String(value);
}
