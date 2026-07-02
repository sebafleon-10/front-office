import { describe, expect, it } from "vitest";
import type { SeasonInputs } from "@/lib/engine";
import { simulateSeasons } from "@/lib/simulate";
import { MC_SEED, PRESETS, TEAMS } from "@/lib/assumptions";

const inputs = (preset: (typeof PRESETS)[keyof typeof PRESETS]): SeasonInputs => ({
  wages: preset.wages,
  academy: preset.academy,
  marketing: preset.marketing,
  facilities: preset.facilities,
  commercial: preset.commercial,
  price: preset.price,
  weightSport: 0.5,
  weightFinance: 0.5,
});

describe("simulateSeasons", () => {
  it("is deterministic for a fixed seed", () => {
    const a = simulateSeasons(inputs(PRESETS.balanced));
    const b = simulateSeasons(inputs(PRESETS.balanced));
    expect(a).toEqual(b);
    const c = simulateSeasons(inputs(PRESETS.balanced), { seed: MC_SEED + 1 });
    expect(c.netP50).not.toBe(a.netP50);
  });

  it("produces a coherent summary shape", () => {
    const s = simulateSeasons(inputs(PRESETS.balanced));
    expect(s.runs).toBe(1000);
    expect(s.positionCounts).toHaveLength(TEAMS);
    expect(s.positionCounts.reduce((a, b) => a + b, 0)).toBe(s.runs);
    expect(s.netHistogram.reduce((a, b) => a + b.count, 0)).toBe(s.runs);
    expect(s.netP5).toBeLessThanOrEqual(s.netP50);
    expect(s.netP50).toBeLessThanOrEqual(s.netP95);
    expect(s.positionP5).toBeLessThanOrEqual(s.positionP50);
    expect(s.positionP50).toBeLessThanOrEqual(s.positionP95);
    for (const p of [s.pPlayoffs, s.pProfit, s.pBottomThree]) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
    expect(s.medianRun.table).toHaveLength(TEAMS);
  });

  it("orders the presets sensibly under uncertainty", () => {
    const buyWins = simulateSeasons(inputs(PRESETS.buyWinsNow));
    const develop = simulateSeasons(inputs(PRESETS.developAndSell));
    // Spending on wins buys table position; developing and selling buys profit.
    expect(buyWins.pPlayoffs).toBeGreaterThan(develop.pPlayoffs);
    expect(develop.pProfit).toBeGreaterThan(buyWins.pProfit);
  });

  it("pins the seeded Balanced distribution (gold layer)", () => {
    const s = simulateSeasons(inputs(PRESETS.balanced));
    // Pinned from the first validated run — any drift in PRNG, noise
    // constants, or engine math shows up here.
    expect(s.positionP50).toBe(6);
    expect([s.positionP5, s.positionP95]).toEqual([3, 9]);
    expect(Math.round(s.netP50)).toBe(-66_151);
    expect(s.pProfit).toBeCloseTo(0.334, 3);
    expect(s.pPlayoffs).toBeCloseTo(0.285, 3);
  });
});
