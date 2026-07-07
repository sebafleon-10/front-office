import { describe, expect, it } from "vitest";
import { runSeason, type SeasonInputs } from "@/lib/engine";
import { simulateSeasons } from "@/lib/simulate";
import { formatBoardPack } from "@/lib/board-pack";
import { PRESETS, YOUR_CLUB_NAME } from "@/lib/assumptions";

const inputs: SeasonInputs = {
  ...PRESETS.balanced,
  weightSport: 0.5,
  weightFinance: 0.5,
};

describe("formatBoardPack", () => {
  it("includes decisions, deterministic plan, risk, debrief and link", () => {
    const result = runSeason(inputs);
    const summary = simulateSeasons(inputs);
    const text = formatBoardPack({
      inputs,
      result,
      summary,
      debrief: "You ran the balanced strategy.",
      url: "https://example.com/?w=600000",
    });

    expect(text).toContain(YOUR_CLUB_NAME);
    expect(text).toContain("Player wages          $600,000");
    expect(text).toContain("6th of 12 · 20 pts");
    expect(text).toContain("-$74,973");
    expect(text).toContain("RISK ACROSS 1,000 SIMULATED SEASONS");
    expect(text).toContain("THE BOARD'S DEBRIEF");
    expect(text).toContain("Open this exact plan: https://example.com/?w=600000");
  });

  it("omits optional sections cleanly", () => {
    const result = runSeason(inputs);
    const text = formatBoardPack({ inputs, result });
    expect(text).not.toContain("RISK ACROSS");
    expect(text).not.toContain("DEBRIEF");
    expect(text).not.toContain("Open this exact plan");
    expect(text).not.toContain("Over-cap financing");
    expect(text.endsWith("\n")).toBe(false);
  });

  it("names the financing penalty when the plan runs over the cap", () => {
    const overCap: SeasonInputs = {
      ...inputs,
      wages: 1_200_000,
      academy: 100_000,
      marketing: 0,
      facilities: 0,
      commercial: 100_000,
    };
    const text = formatBoardPack({ inputs: overCap, result: runSeason(overCap) });
    expect(text).toContain("Over-cap financing    $24,000");
  });
});
