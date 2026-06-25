import type { SeasonInputs, SeasonResult } from "./engine";

export interface CoachRequestBody {
  inputs: SeasonInputs;
  result: SeasonResult;
}

export interface CoachResponseBody {
  debrief: string;
}
