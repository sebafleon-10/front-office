import { describe, expect, it } from "vitest";
import { runSeason, type SeasonInputs } from "@/lib/engine";
import {
  computeMarginalImpacts,
  MARGINAL_STEP,
  PRICE_MARGINAL_STEP,
} from "@/lib/sensitivity";
import { INPUT_RANGES, PRESETS } from "@/lib/assumptions";

const balanced: SeasonInputs = {
  ...PRESETS.balanced,
  weightSport: 0.5,
  weightFinance: 0.5,
};

describe("computeMarginalImpacts", () => {
  it("matches an explicit runSeason diff for each lever on the balanced preset", () => {
    const base = runSeason(balanced);
    const impacts = computeMarginalImpacts(balanced);
    expect(impacts).toHaveLength(6);

    const wages = impacts.find((i) => i.key === "wages")!;
    const wagesProbe = runSeason({
      ...balanced,
      wages: balanced.wages + MARGINAL_STEP,
    });
    expect(wages.deltaNet).toBeCloseTo(wagesProbe.net - base.net, 6);
    expect(wages.deltaPosition).toBe(base.position - wagesProbe.position);
    expect(wages.atMax).toBe(false);

    const price = impacts.find((i) => i.key === "price")!;
    const priceProbe = runSeason({
      ...balanced,
      price: balanced.price + PRICE_MARGINAL_STEP,
    });
    expect(price.deltaNet).toBeCloseTo(priceProbe.net - base.net, 6);
  });

  it("flags a lever at its range maximum instead of probing past it", () => {
    const maxed = { ...balanced, wages: INPUT_RANGES.wages.max };
    const impacts = computeMarginalImpacts(maxed);
    const wages = impacts.find((i) => i.key === "wages")!;
    expect(wages.atMax).toBe(true);
    expect(wages.deltaNet).toBe(0);
    // The other levers still probe normally.
    const academy = impacts.find((i) => i.key === "academy")!;
    expect(academy.atMax).toBe(false);
  });

  it("carries the financing fee inside a probe that crosses the cap", () => {
    // Base controllable = $1.18M; the +$50K wages probe lands at $1.23M,
    // $30K over the cap, so the probed season pays exactly $3,600 of
    // financing — and the marginal delta must include it.
    const nearCap: SeasonInputs = {
      ...balanced,
      wages: 700_000,
      academy: 150_000,
      marketing: 120_000,
      facilities: 120_000,
      commercial: 90_000,
    };
    const base = runSeason(nearCap);
    expect(base.financingCost).toBe(0);
    const probe = runSeason({
      ...nearCap,
      wages: nearCap.wages + MARGINAL_STEP,
    });
    expect(probe.financingCost).toBe(3_600); // ($1.23M − $1.2M) × 0.12
    const wages = computeMarginalImpacts(nearCap).find(
      (i) => i.key === "wages",
    )!;
    expect(wages.deltaNet).toBeCloseTo(probe.net - base.net, 6);
  });
});
