import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, __resetRateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
  });

  it("allows hits up to the limit, then blocks", () => {
    const limit = 3;
    const windowMs = 60_000;
    const t0 = 1_000_000;

    expect(rateLimit("a", limit, windowMs, t0).ok).toBe(true); // 1
    expect(rateLimit("a", limit, windowMs, t0).ok).toBe(true); // 2
    const third = rateLimit("a", limit, windowMs, t0);
    expect(third.ok).toBe(true); // 3
    expect(third.remaining).toBe(0);

    const blocked = rateLimit("a", limit, windowMs, t0);
    expect(blocked.ok).toBe(false); // 4 -> blocked
    expect(blocked.retryAfterMs).toBe(windowMs);
  });

  it("resets after the window elapses", () => {
    const limit = 2;
    const windowMs = 60_000;
    const t0 = 1_000_000;

    rateLimit("b", limit, windowMs, t0);
    rateLimit("b", limit, windowMs, t0);
    expect(rateLimit("b", limit, windowMs, t0).ok).toBe(false);

    // Just before reset: still blocked.
    expect(rateLimit("b", limit, windowMs, t0 + windowMs - 1).ok).toBe(false);
    // At/after reset: allowed again.
    expect(rateLimit("b", limit, windowMs, t0 + windowMs).ok).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limit = 1;
    const windowMs = 60_000;
    const t0 = 1_000_000;

    expect(rateLimit("ip-1", limit, windowMs, t0).ok).toBe(true);
    expect(rateLimit("ip-1", limit, windowMs, t0).ok).toBe(false);
    // A different key is unaffected.
    expect(rateLimit("ip-2", limit, windowMs, t0).ok).toBe(true);
  });
});
