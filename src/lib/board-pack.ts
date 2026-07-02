import type { SeasonInputs, SeasonResult } from "./engine";
import type { MonteCarloSummary } from "./simulate";
import { YOUR_CLUB_NAME } from "./assumptions";
import {
  formatMoney,
  formatMoneySigned,
  formatNumber,
  ordinal,
} from "./format";

/**
 * Plain-text season summary for the clipboard — pastes cleanly into an
 * email, a doc, or a chat. Pure function so it's unit-testable.
 */

export interface BoardPackData {
  inputs: SeasonInputs;
  result: SeasonResult;
  summary?: MonteCarloSummary | null;
  debrief?: string | null;
  url?: string | null;
}

const label = (s: string) => s.padEnd(22, " ");
const pct = (p: number) => `${Math.round(p * 100)}%`;

export function formatBoardPack(d: BoardPackData): string {
  const { inputs, result, summary, debrief, url } = d;
  const sportPct = Math.round(inputs.weightSport * 100);

  const lines: string[] = [
    `FRONT OFFICE — SEASON BOARD PACK`,
    `${YOUR_CLUB_NAME} · USL League Two · one season`,
    ``,
    `DECISIONS`,
    `  ${label("Player wages")}${formatMoney(inputs.wages)}`,
    `  ${label("Academy investment")}${formatMoney(inputs.academy)}`,
    `  ${label("Marketing & community")}${formatMoney(inputs.marketing)}`,
    `  ${label("Matchday & facilities")}${formatMoney(inputs.facilities)}`,
    `  ${label("Sponsorship sales")}${formatMoney(inputs.commercial)}`,
    `  ${label("Ticket price")}$${inputs.price}`,
    `  ${label("Success weighting")}${sportPct}% sport / ${100 - sportPct}% finance`,
    ``,
    `PLAN ON PAPER (deterministic engine)`,
    `  ${label("Finish")}${ordinal(result.position)} of 12 · ${result.points} pts (${result.positionLabel})`,
    `  ${label("Net result")}${formatMoneySigned(Math.round(result.net))}`,
    `  ${label("Attendance")}${formatNumber(result.attendance)} of 6,000 seats`,
    `  ${label("Club health")}${Math.round(result.health)}/100`,
  ];

  if (summary) {
    lines.push(
      ``,
      `RISK ACROSS ${formatNumber(summary.runs)} SIMULATED SEASONS`,
      `  ${label("Median finish")}${ordinal(summary.positionP50)} (${ordinal(summary.positionP5)}–${ordinal(summary.positionP95)} in 90% of seasons)`,
      `  ${label("Median net")}${formatMoneySigned(Math.round(summary.netP50))} (worst 5% ${formatMoneySigned(Math.round(summary.netP5))}, best 5% ${formatMoneySigned(Math.round(summary.netP95))})`,
      `  ${label("Odds")}playoffs ${pct(summary.pPlayoffs)} · profitable ${pct(summary.pProfit)} · bottom three ${pct(summary.pBottomThree)}`,
    );
  }

  if (debrief && debrief.trim()) {
    lines.push(``, `THE BOARD'S DEBRIEF`, debrief.trim());
  }

  if (url) {
    lines.push(``, `Open this exact plan: ${url}`);
  }

  return lines.join("\n");
}
