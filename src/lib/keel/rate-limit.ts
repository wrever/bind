/**
 * Simple sliding-window rate limiter for demo API abuse controls.
 * In-memory only — resets on process restart (acceptable for demo).
 */

export type RateLimitRule = {
  /** Max events inside the window */
  limit: number;
  /** Window length in ms */
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number; limit: number };

type Bucket = number[];

const g = globalThis as unknown as {
  __keelRateBuckets?: Map<string, Bucket>;
};

function buckets() {
  if (!g.__keelRateBuckets) g.__keelRateBuckets = new Map();
  return g.__keelRateBuckets;
}

/** Default anti-abuse rules (dispute flood + transfer spam). */
export const DEFAULT_RULES: Record<string, RateLimitRule> = {
  dispute: { limit: 3, windowMs: 60_000 },
  transfer: { limit: 40, windowMs: 60_000 },
  resolve: { limit: 20, windowMs: 60_000 },
};

/**
 * Consume one unit for `key` under `rule`.
 * Key should already include session + action + subject.
 */
export function consume(
  key: string,
  rule: RateLimitRule,
  now = Date.now(),
): RateLimitResult {
  const map = buckets();
  const cutoff = now - rule.windowMs;
  const prev = (map.get(key) ?? []).filter((t) => t > cutoff);
  if (prev.length >= rule.limit) {
    const oldest = prev[0] ?? now;
    return {
      ok: false,
      retryAfterMs: Math.max(0, oldest + rule.windowMs - now),
      limit: rule.limit,
    };
  }
  prev.push(now);
  map.set(key, prev);
  return { ok: true, remaining: rule.limit - prev.length };
}

/** Test helper — clear all buckets. */
export function resetRateLimits() {
  buckets().clear();
}
