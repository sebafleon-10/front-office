export const GAMES = 14;
export const HOME = 7;
export const TEAMS = 12;

export const BUDGET = 1_200_000;

/*
 * OVERAGE_FINANCING_RATE: the board does not block an over-cap plan, it
 * finances the gap, and that money is not free. Spend above the budget is
 * charged at 12% for the season, priced like the emergency working-capital
 * facility a lower-league club would actually lean on (short-term, unsecured,
 * arranged mid-season). At or under the cap the charge is exactly zero, so
 * every under-budget season is untouched by it.
 */
export const OVERAGE_FINANCING_RATE = 0.12;

export const WAGE_BENCHMARK = 600_000;
export const ACADEMY_BENCHMARK = 150_000;
export const MARKETING_BENCHMARK = 120_000;
export const FACILITIES_BENCHMARK = 120_000;
export const COMMERCIAL_BENCHMARK = 90_000;

export const BASE_QUALITY = 50;
export const AVG_QUALITY = 50;
export const BASE_PPG = 1.35;
export const PPG_PER_QUALITY = 0.030;
export const AVG_POINTS = 19;

export const ACADEMY_BUMP_FACTOR = 3;
export const ACADEMY_BUMP_CAP = 3;

export const MIN_QUALITY = 15;
export const MAX_QUALITY = 92;
export const MIN_PPG = 0.30;
export const MAX_PPG = 2.60;

export const BASE_FANBASE = 8000;
export const CAPACITY = 6000;
export const BASE_CONVERSION = 0.45;
export const BASE_PRICE = 18;
export const ELASTICITY = 0.6;

export const MARKETING_FAN_FACTOR = 0.5;
export const SUCCESS_FAN_FACTOR = 0.30;
export const FANBASE_FLOOR_MULT = 0.6;

export const FACILITIES_CONV_FACTOR = 0.4;
export const FORM_ATT_FACTOR = 0.20;

export const SUCCESS_FLOOR = -0.15;
export const FORM_FLOOR = -0.15;

export const MIN_CONVERSION = 0.10;
export const MAX_CONVERSION = 0.95;

export const CONCESSIONS_PER_HEAD = 12;
export const MERCH_PER_FAN = 9;
export const MATCHDAY_COST_PER_HEAD = 6;

export const BASE_SPONSOR = 400_000;
export const FIXED_OVERHEAD = 400_000;
export const BASE_TRADING = 50_000;
export const ACADEMY_YIELD = 180_000;
export const PRIZE_STEP = 8_000;

export const COMMERCIAL_SPON_FACTOR = 0.6;
export const SPON_SUCCESS_FACTOR = 0.5;
export const SPON_SUCCESS_FLOOR = 0.7;
export const SPON_FAN_FACTOR = 0.4;
export const MERCH_FORM_FACTOR = 0.3;
export const MERCH_FORM_FLOOR = 0.8;

export const FIN_SCORE_SCALE = 500_000;

/*
 * Monte Carlo layer ("Run the season").
 *
 * PPG_SD: a single game pays 0, 1 or 3 points. For a mid-table side
 * (roughly 36% wins, 27% draws at the league-average 1.35 ppg) one game's
 * points carry a standard deviation of about 1.3, so the season-average
 * ppg noise over 14 independent games is 1.3 / √14 ≈ 0.35. We shade that
 * to 0.30 because part of real scorelines is explained by the quality gap
 * already priced into the deterministic mean.
 *
 * CONVERSION_SD: season-average turnout swings with weather, kickoff
 * times and the fixture draw; ±10% across a season at two sigma gives a
 * multiplicative sd of 0.05.
 *
 * Rivals share the same luck: each rival's season-average ppg takes a
 * normal shock of sd PPG_SD per run (clamped to the same ppg bounds), so
 * the whole table varies together. RIVAL_POINTS below is the league at
 * par: the fixed reference ladder the deterministic plan view ranks
 * against (documented in About the model).
 *
 * Zero shocks reproduce the deterministic engine exactly: a gold test
 * pins that invariance.
 */
export const PPG_SD = 0.3;
export const CONVERSION_SD = 0.05;
export const MC_RUNS = 1000;
export const MC_SEED = 0x5eba11;

export const RIVAL_POINTS: readonly number[] = [
  31, 28, 26, 23, 21, 19, 17, 15, 13, 11, 9,
];

export const RIVAL_NAMES: readonly string[] = [
  "Riverside Athletic",
  "Northgate United",
  "Harbor City FC",
  "Ironside FC",
  "Granite City",
  "Eastvale Rovers",
  "Fox Valley FC",
  "Cedar Park",
  "Sunset Republic",
  "Millbrook Town",
  "Junction City",
];

export const YOUR_CLUB_NAME = "Meridian FC";

export const INPUT_RANGES = {
  wages: { min: 0, max: 1_200_000, step: 5_000 },
  academy: { min: 0, max: 600_000, step: 5_000 },
  marketing: { min: 0, max: 400_000, step: 5_000 },
  facilities: { min: 0, max: 400_000, step: 5_000 },
  commercial: { min: 0, max: 200_000, step: 5_000 },
  price: { min: 8, max: 35, step: 1 },
} as const;

export const PAR_VALUES = {
  wages: WAGE_BENCHMARK,
  academy: ACADEMY_BENCHMARK,
  marketing: MARKETING_BENCHMARK,
  facilities: FACILITIES_BENCHMARK,
  commercial: COMMERCIAL_BENCHMARK,
  price: BASE_PRICE,
} as const;

export const PRESETS = {
  balanced: {
    name: "Balanced",
    wages: 600_000,
    academy: 150_000,
    marketing: 120_000,
    facilities: 120_000,
    commercial: 90_000,
    price: 18,
  },
  buyWinsNow: {
    name: "Buy wins now",
    wages: 900_000,
    academy: 40_000,
    marketing: 110_000,
    facilities: 80_000,
    commercial: 70_000,
    price: 22,
  },
  developAndSell: {
    name: "Develop and sell",
    wages: 520_000,
    academy: 420_000,
    marketing: 90_000,
    facilities: 90_000,
    commercial: 80_000,
    price: 15,
  },
  growFanbase: {
    name: "Grow fanbase",
    wages: 560_000,
    academy: 60_000,
    marketing: 260_000,
    facilities: 220_000,
    commercial: 100_000,
    price: 14,
  },
} as const;

export type PresetKey = keyof typeof PRESETS;
