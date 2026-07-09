import { INPUT_RANGES, PRESETS } from "./assumptions";
import type { ControlState } from "@/components/ControlPanel";

/**
 * The whole plan fits in seven query params, so any scenario is a link:
 *   ?w=600000&a=150000&m=120000&f=120000&c=90000&p=18&ws=50
 * Every value read from a URL is clamped to the lever ranges and snapped to
 * the lever step: the URL is user input and is never trusted.
 */

export const DEFAULT_STATE: ControlState = {
  wages: PRESETS.balanced.wages,
  academy: PRESETS.balanced.academy,
  marketing: PRESETS.balanced.marketing,
  facilities: PRESETS.balanced.facilities,
  commercial: PRESETS.balanced.commercial,
  price: PRESETS.balanced.price,
  weightSportPct: 50,
};

type SearchParams = Record<string, string | string[] | undefined>;

const PARAM_KEYS = ["w", "a", "m", "f", "c", "p", "ws"] as const;

function firstNumber(value: string | string[] | undefined): number | null {
  const s = Array.isArray(value) ? value[0] : value;
  if (s == null || s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function clampToRange(
  n: number,
  range: { min: number; max: number; step: number },
): number {
  const clamped = Math.min(range.max, Math.max(range.min, n));
  return Math.round(clamped / range.step) * range.step;
}

export function hasStateParams(sp: SearchParams): boolean {
  return PARAM_KEYS.some((k) => sp[k] != null);
}

export function parseUrlState(sp: SearchParams): ControlState {
  const pick = (
    key: string,
    range: { min: number; max: number; step: number },
    fallback: number,
  ) => {
    const n = firstNumber(sp[key]);
    return n === null ? fallback : clampToRange(n, range);
  };

  const ws = firstNumber(sp.ws);

  return {
    wages: pick("w", INPUT_RANGES.wages, DEFAULT_STATE.wages),
    academy: pick("a", INPUT_RANGES.academy, DEFAULT_STATE.academy),
    marketing: pick("m", INPUT_RANGES.marketing, DEFAULT_STATE.marketing),
    facilities: pick("f", INPUT_RANGES.facilities, DEFAULT_STATE.facilities),
    commercial: pick("c", INPUT_RANGES.commercial, DEFAULT_STATE.commercial),
    price: pick("p", INPUT_RANGES.price, DEFAULT_STATE.price),
    weightSportPct:
      ws === null
        ? DEFAULT_STATE.weightSportPct
        : Math.min(100, Math.max(0, Math.round(ws))),
  };
}

export function serializeState(state: ControlState): string {
  return new URLSearchParams({
    w: String(state.wages),
    a: String(state.academy),
    m: String(state.marketing),
    f: String(state.facilities),
    c: String(state.commercial),
    p: String(state.price),
    ws: String(state.weightSportPct),
  }).toString();
}

export function isDefaultState(state: ControlState): boolean {
  return (Object.keys(DEFAULT_STATE) as (keyof ControlState)[]).every(
    (k) => state[k] === DEFAULT_STATE[k],
  );
}
