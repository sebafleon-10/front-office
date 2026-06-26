/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * Best-effort by design: on serverless this state lives in a single warm
 * instance, resets on cold start, and is not shared across instances. It
 * deters casual abuse / scripted loops; the hard cost ceiling is the Anthropic
 * Console monthly spend cap, not this module.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();
const MAX_KEYS = 5000; // bound memory against unique-key floods

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

/** Drop expired windows so the map can't grow unbounded. */
function prune(now: number): void {
  for (const [key, win] of store) {
    if (now >= win.resetAt) store.delete(key);
  }
}

/**
 * Record a hit against `key` and report whether it is within `limit` per
 * `windowMs`. `now` is injectable so the limiter can be tested deterministically.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const win = store.get(key);

  if (!win || now >= win.resetAt) {
    if (store.size >= MAX_KEYS) prune(now);
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (win.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: win.resetAt - now };
  }

  win.count += 1;
  return { ok: true, remaining: limit - win.count, retryAfterMs: 0 };
}

/** Test-only: clear all windows. */
export function __resetRateLimit(): void {
  store.clear();
}
