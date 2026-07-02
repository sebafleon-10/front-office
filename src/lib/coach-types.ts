import type { SeasonInputs, SeasonResult } from "./engine";

/** Compact risk profile from the Monte Carlo layer, passed to the coach. */
export interface CoachRisk {
  runs: number;
  positionP5: number;
  positionP50: number;
  positionP95: number;
  netP5: number;
  netP50: number;
  netP95: number;
  pPlayoffs: number;
  pProfit: number;
  pBottomThree: number;
}

export interface CoachRequestBody {
  inputs: SeasonInputs;
  result: SeasonResult;
  risk?: CoachRisk;
}
