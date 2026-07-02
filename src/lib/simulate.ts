import {
  CONVERSION_SD,
  MC_RUNS,
  MC_SEED,
  PPG_SD,
  TEAMS,
} from "./assumptions";
import { runSeason, type SeasonInputs, type SeasonResult } from "./engine";

/**
 * The Monte Carlo layer. The deterministic engine stays untouched — this
 * module draws seeded season shocks, replays the same decisions across many
 * seasons, and summarizes the spread. Same inputs + same seed always produce
 * the same summary, so the distribution itself is testable.
 */

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface MonteCarloSummary {
  runs: number;
  /** Index 0 = 1st place … index TEAMS-1 = last. */
  positionCounts: number[];
  positionP5: number;
  positionP50: number;
  positionP95: number;
  netHistogram: HistogramBin[];
  netP5: number;
  netP50: number;
  netP95: number;
  healthP50: number;
  /** Share of seasons finishing in the top four. */
  pPlayoffs: number;
  /** Share of seasons ending with net >= 0. */
  pProfit: number;
  /** Share of seasons finishing in the bottom three. */
  pBottomThree: number;
  /** The full result of the run with median club health — one honest sampled season. */
  medianRun: SeasonResult;
}

export interface SimulateOptions {
  runs?: number;
  seed?: number;
}

/** Deterministic 32-bit PRNG — tiny, seedable, good enough for season noise. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller: turns two uniforms into one standard normal draw. */
function makeNormal(rand: () => number): () => number {
  return () => {
    const u = Math.max(rand(), 1e-12);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((p / 100) * (sorted.length - 1))),
  );
  return sorted[idx];
}

const NET_BINS = 24;

function buildHistogram(nets: number[]): HistogramBin[] {
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (min === max) {
    return [{ start: min, end: max, count: nets.length }];
  }
  const width = (max - min) / NET_BINS;
  const bins: HistogramBin[] = Array.from({ length: NET_BINS }, (_, i) => ({
    start: min + i * width,
    end: min + (i + 1) * width,
    count: 0,
  }));
  for (const net of nets) {
    const i = Math.min(NET_BINS - 1, Math.floor((net - min) / width));
    bins[i].count += 1;
  }
  return bins;
}

export function simulateSeasons(
  inputs: SeasonInputs,
  options: SimulateOptions = {},
): MonteCarloSummary {
  const runs = options.runs ?? MC_RUNS;
  const seed = options.seed ?? MC_SEED;

  const normal = makeNormal(mulberry32(seed));
  const results: SeasonResult[] = [];
  for (let i = 0; i < runs; i++) {
    results.push(
      runSeason(inputs, {
        ppg: normal() * PPG_SD,
        conversion: normal() * CONVERSION_SD,
      }),
    );
  }

  const positionCounts = new Array<number>(TEAMS).fill(0);
  for (const r of results) positionCounts[r.position - 1] += 1;

  const nets = results.map((r) => r.net).sort((a, b) => a - b);
  const positions = results.map((r) => r.position).sort((a, b) => a - b);

  const byHealth = [...results].sort((a, b) => a.health - b.health);
  const medianRun = byHealth[Math.floor(byHealth.length / 2)];

  return {
    runs,
    positionCounts,
    positionP5: percentile(positions, 5),
    positionP50: percentile(positions, 50),
    positionP95: percentile(positions, 95),
    netHistogram: buildHistogram(nets),
    netP5: percentile(nets, 5),
    netP50: percentile(nets, 50),
    netP95: percentile(nets, 95),
    healthP50: percentile(
      results.map((r) => r.health).sort((a, b) => a - b),
      50,
    ),
    pPlayoffs: results.filter((r) => r.position <= 4).length / runs,
    pProfit: results.filter((r) => r.net >= 0).length / runs,
    pBottomThree: results.filter((r) => r.position >= TEAMS - 2).length / runs,
    medianRun,
  };
}
