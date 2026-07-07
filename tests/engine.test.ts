import { describe, expect, it } from "vitest";
import { runSeason, type SeasonInputs } from "@/lib/engine";
import {
  PRESETS,
  MIN_QUALITY,
  MAX_QUALITY,
  MAX_PPG,
  MAX_CONVERSION,
  CAPACITY,
  PRIZE_STEP,
  RIVAL_POINTS,
  TEAMS,
} from "@/lib/assumptions";

const balanced = (
  preset: (typeof PRESETS)[keyof typeof PRESETS],
): SeasonInputs => ({
  wages: preset.wages,
  academy: preset.academy,
  marketing: preset.marketing,
  facilities: preset.facilities,
  commercial: preset.commercial,
  price: preset.price,
  weightSport: 0.5,
  weightFinance: 0.5,
});

describe("runSeason gold scenarios", () => {
  it("Balanced finishes 6th with about -$74,973 net and health ~48.5", () => {
    const r = runSeason(balanced(PRESETS.balanced));
    expect(r.points).toBe(20);
    expect(r.position).toBe(6);
    expect(r.net).toBeCloseTo(-74_973, 0);
    expect(Math.abs(r.health - 48.5)).toBeLessThan(0.1);
  });

  it("Buy wins now finishes 4th with about -$260,686 net and health ~48.3", () => {
    const r = runSeason(balanced(PRESETS.buyWinsNow));
    expect(r.points).toBe(24);
    expect(r.position).toBe(4);
    expect(r.net).toBeCloseTo(-260_686, 0);
    expect(Math.abs(r.health - 48.3)).toBeLessThan(0.1);
  });

  it("Develop and sell finishes 5th with about +$90,660 net and health ~61.4", () => {
    const r = runSeason(balanced(PRESETS.developAndSell));
    expect(r.points).toBe(21);
    expect(r.position).toBe(5);
    expect(r.net).toBeCloseTo(90_660, 0);
    expect(Math.abs(r.health - 61.4)).toBeLessThan(0.1);
  });

  it("Grow fanbase finishes 6th with about -$54,876 net and health ~49.5", () => {
    const r = runSeason(balanced(PRESETS.growFanbase));
    expect(r.points).toBe(19);
    expect(r.position).toBe(6);
    expect(r.net).toBeCloseTo(-54_876, 0);
    expect(Math.abs(r.health - 49.5)).toBeLessThan(0.1);
  });
});

describe("league table", () => {
  it("inserts Your Club at the correct position by points", () => {
    const r = runSeason(balanced(PRESETS.balanced));
    expect(r.table).toHaveLength(12);
    const yourIndex = r.table.findIndex((row) => row.isYourClub);
    expect(yourIndex).toBe(r.position - 1);
  });

  it("orders rows by points descending", () => {
    const r = runSeason(balanced(PRESETS.buyWinsNow));
    for (let i = 1; i < r.table.length; i++) {
      expect(r.table[i - 1].points).toBeGreaterThanOrEqual(r.table[i].points);
    }
  });
});

describe("budget meter state", () => {
  it("flags over budget when controllable exceeds 1.2m", () => {
    const r = runSeason({
      wages: 1_200_000,
      academy: 100_000,
      marketing: 0,
      facilities: 0,
      commercial: 100_000,
      price: 18,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(r.controllable).toBe(1_400_000);
    expect(r.overBudget).toBe(true);
    expect(r.budgetRemaining).toBe(-200_000);
  });

  it("stays under budget for the balanced preset", () => {
    const r = runSeason(balanced(PRESETS.balanced));
    expect(r.overBudget).toBe(false);
    expect(r.controllable).toBe(1_080_000);
  });
});

describe("budget overage financing", () => {
  // Pinned like the gold scenarios: the under-cap season is untouched, and
  // the over-cap season pays exactly rate × overage on top of the old cost.
  it("charges 12% emergency financing on spend above the cap (pinned)", () => {
    const r = runSeason({
      wages: 1_200_000,
      academy: 100_000,
      marketing: 0,
      facilities: 0,
      commercial: 100_000,
      price: 18,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(r.controllable).toBe(1_400_000);
    expect(r.financingCost).toBe(24_000); // ($1.4M − $1.2M) × 0.12
    expect(r.totalCost).toBeCloseTo(1_887_770, 0);
    expect(r.net).toBeCloseTo(-765_942, 0);
  });

  it("charges nothing at or under the cap", () => {
    const balanced_ = runSeason(balanced(PRESETS.balanced));
    expect(balanced_.financingCost).toBe(0);

    const atCap = runSeason({
      wages: 1_200_000,
      academy: 0,
      marketing: 0,
      facilities: 0,
      commercial: 0,
      price: 18,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(atCap.controllable).toBe(1_200_000);
    expect(atCap.overBudget).toBe(false);
    expect(atCap.financingCost).toBe(0);
  });
});

describe("clamp and boundary behavior", () => {
  it("floors squad quality and drops to last place when nothing is spent", () => {
    const r = runSeason({
      wages: 0,
      academy: 0,
      marketing: 0,
      facilities: 0,
      commercial: 0,
      price: 18,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(r.quality).toBe(MIN_QUALITY);
    expect(r.position).toBe(TEAMS); // bottom of the table
  });

  it("caps squad quality, points-per-game, and placement under extreme spend", () => {
    const r = runSeason({
      wages: 5_000_000,
      academy: 2_000_000,
      marketing: 400_000,
      facilities: 400_000,
      commercial: 200_000,
      price: 18,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(r.quality).toBe(MAX_QUALITY);
    expect(r.ppg).toBeCloseTo(MAX_PPG, 5);
    expect(r.position).toBe(1); // champions
  });

  it("caps conversion and attendance at stadium capacity in peak demand", () => {
    const r = runSeason({
      wages: 1_200_000,
      academy: 600_000,
      marketing: 400_000,
      facilities: 400_000,
      commercial: 200_000,
      price: 8,
      weightSport: 0.5,
      weightFinance: 0.5,
    });
    expect(r.conversion).toBe(MAX_CONVERSION);
    expect(r.attendance).toBe(CAPACITY);
  });

  it("collapses club health onto a single score at the weighting extremes", () => {
    const base = balanced(PRESETS.balanced);
    const sportOnly = runSeason({ ...base, weightSport: 1, weightFinance: 0 });
    const financeOnly = runSeason({ ...base, weightSport: 0, weightFinance: 1 });
    expect(sportOnly.health).toBeCloseTo(sportOnly.sportScore, 5);
    expect(financeOnly.health).toBeCloseTo(financeOnly.finScore, 5);
    // The two definitions of success diverge for the same season.
    expect(Math.abs(sportOnly.health - financeOnly.health)).toBeGreaterThan(1);
  });
});

describe("shock invariance", () => {
  it("zero shocks reproduce the deterministic season exactly", () => {
    for (const key of Object.keys(PRESETS) as (keyof typeof PRESETS)[]) {
      const inputs = balanced(PRESETS[key]);
      expect(runSeason(inputs, { ppg: 0, conversion: 0 })).toEqual(
        runSeason(inputs),
      );
    }
  });

  it("passing the fixed rival points explicitly changes nothing", () => {
    const inputs = balanced(PRESETS.balanced);
    expect(
      runSeason(inputs, { ppg: 0, conversion: 0, rivalPoints: RIVAL_POINTS }),
    ).toEqual(runSeason(inputs));
  });

  it("a rival shock reranks the table but leaves the club's own season alone", () => {
    const inputs = balanced(PRESETS.balanced);
    const base = runSeason(inputs);
    // Every rival has a great year: +6 points across the board.
    const shifted = runSeason(inputs, {
      ppg: 0,
      conversion: 0,
      rivalPoints: RIVAL_POINTS.map((p) => p + 6),
    });
    expect(shifted.points).toBe(base.points);
    expect(shifted.position).toBeGreaterThan(base.position);
    // Money moves only through prize steps tied to placement.
    expect(base.net - shifted.net).toBeCloseTo(
      (shifted.position - base.position) * PRIZE_STEP,
      6,
    );
    expect(shifted.attendance).toBe(base.attendance);
    expect(shifted.sponsorship).toBe(base.sponsorship);
  });
});
