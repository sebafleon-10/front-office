import { INPUT_RANGES } from "./assumptions";
import { runSeason, type SeasonInputs } from "./engine";
import { LEVERS, type LeverKey } from "./levers";

/**
 * Marginal analysis at the current plan: what one more increment on each
 * lever does to the season. Pure orchestration over the deterministic
 * engine — every figure here is a real runSeason diff, so the panel can
 * never disagree with the P&L.
 */

export const MARGINAL_STEP = 50_000;
export const PRICE_MARGINAL_STEP = 1;

export interface MarginalImpact {
  key: LeverKey;
  /** Short lever name for display ("Wages", "Ticket price", …). */
  label: string;
  /** The probe applied, for display ("+$50K", "+$1"). */
  stepLabel: string;
  /** Change in net result from the probe. */
  deltaNet: number;
  /** Places climbed (positive) or dropped (negative) from the probe. */
  deltaPosition: number;
  /** Lever already at its range maximum — no probe possible. */
  atMax: boolean;
}

export function computeMarginalImpacts(
  inputs: SeasonInputs,
): MarginalImpact[] {
  const base = runSeason(inputs);

  return LEVERS.map((lever) => {
    const step = lever.key === "price" ? PRICE_MARGINAL_STEP : MARGINAL_STEP;
    const stepLabel = lever.key === "price" ? "+$1" : "+$50K";
    const current = inputs[lever.key];
    const max = INPUT_RANGES[lever.key].max;

    if (current >= max) {
      return {
        key: lever.key,
        label: lever.short,
        stepLabel,
        deltaNet: 0,
        deltaPosition: 0,
        atMax: true,
      };
    }

    const probe = runSeason({
      ...inputs,
      [lever.key]: Math.min(current + step, max),
    });

    return {
      key: lever.key,
      label: lever.short,
      stepLabel,
      deltaNet: probe.net - base.net,
      deltaPosition: base.position - probe.position,
      atMax: false,
    };
  });
}
