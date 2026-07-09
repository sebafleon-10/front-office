"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import {
  formatCompactMoney,
  formatMoneySigned,
  formatPercent,
  ordinal,
} from "@/lib/format";
import type { MonteCarloSummary } from "@/lib/simulate";

interface SeasonRunPanelProps {
  summary: MonteCarloSummary | null;
  stale: boolean;
  onRun: () => void;
  /** Changes with every run so the reveal re-plays. */
  runId: number;
  /** Secondary actions (pin, copy link, board pack) shown after a run. */
  actions?: React.ReactNode;
}

const EASE = [0.32, 0.72, 0, 1] as const;

function pct(share: number): string {
  return formatPercent(share * 100);
}

export function SeasonRunPanel({
  summary,
  stale,
  onRun,
  runId,
  actions,
}: SeasonRunPanelProps) {
  const reduce = useReducedMotion();

  return (
    <Card>
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <CardEyebrow>The moment of truth</CardEyebrow>
          <CardTitle className="mt-1">Run the season</CardTitle>
        </div>
        <button
          type="button"
          onClick={onRun}
          className="fo-btn-primary px-4 py-2 text-[13px]"
        >
          {summary ? "Run it again" : "Run the season"}
        </button>
      </header>

      {/* Plain conditional render: AnimatePresence mode="wait" freezes if the
          tab is hidden mid-transition (rAF pauses), leaving the panel stuck. */}
      {summary ? (
          <motion.div
            key={`run-${runId}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0.01 : 0.2, ease: EASE }}
            className={stale ? "opacity-60 transition-opacity" : ""}
          >
            {stale && (
              <p className="mb-4 rounded-[8px] border border-[var(--color-hairline)] bg-[var(--color-surface-1)] px-3 py-2 text-[12px] text-[var(--color-text-muted)]">
                Plan changed since this run. Run it again to refresh the odds.
              </p>
            )}

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <RevealStat
                order={0}
                reduce={!!reduce}
                label="Median finish"
                value={ordinal(summary.positionP50)}
                detail={`${ordinal(summary.positionP5)}–${ordinal(summary.positionP95)} in 90% of seasons`}
              />
              <RevealStat
                order={1}
                reduce={!!reduce}
                label="Median net"
                value={formatMoneySigned(Math.round(summary.netP50))}
                tone={summary.netP50 >= 0 ? "profit" : "loss"}
                detail={`Worst 5%: ${formatCompactMoney(summary.netP5)} · Best 5%: ${formatCompactMoney(summary.netP95)}`}
              />
              <RevealStat
                order={2}
                reduce={!!reduce}
                label="The odds"
                value={`${pct(summary.pPlayoffs)} playoffs`}
                detail={`Profitable in ${pct(summary.pProfit)} of seasons · Bottom three in ${pct(summary.pBottomThree)}`}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <PositionStrip summary={summary} reduce={!!reduce} />
              <NetHistogram summary={summary} reduce={!!reduce} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] leading-relaxed text-[var(--color-text-subtle)]">
                {summary.runs.toLocaleString("en-US")}{" "}seasons of the same
                plan, different luck: seeded noise on form (the week-to-week
                swing in results) and turnout, over the exact deterministic
                engine, for your club and every rival alike. The dashboard
                above is the league at par; here the whole table breathes.
              </p>
              {actions && (
                <div className="flex flex-none flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <p className="text-[14px] leading-relaxed text-[var(--color-text-muted)]">
            The dashboard above is your plan on paper: the season an average
            run of luck produces. Football is not played on paper. Run this
            plan through 1,000 simulated seasons of swings in form (the
            week-to-week luck of results) and turnout, and see the range you
            actually signed up for: the playoff odds, the chance the books
            close in the black, and the downside the board should hear about
            first.
          </p>
        )}
    </Card>
  );
}

function RevealStat({
  order,
  reduce,
  label,
  value,
  detail,
  tone,
}: {
  order: number;
  reduce: boolean;
  label: string;
  value: string;
  detail: string;
  tone?: "profit" | "loss";
}) {
  const color =
    tone === "profit"
      ? "text-[var(--color-profit)]"
      : tone === "loss"
        ? "text-[var(--color-loss)]"
        : "text-[var(--color-text)]";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : 0.1 + order * 0.12, ease: EASE }}
      className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-4"
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
        {label}
      </p>
      <p className={`fo-tnum fo-tight mt-2 text-[26px] font-semibold leading-none ${color}`}>
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
        {detail}
      </p>
    </motion.div>
  );
}

function PositionStrip({
  summary,
  reduce,
}: {
  summary: MonteCarloSummary;
  reduce: boolean;
}) {
  const max = Math.max(...summary.positionCounts, 1);
  return (
    <div>
      <p className="text-[12px] font-medium text-[var(--color-text-subtle)]">
        Where you finish
      </p>
      <div
        className="mt-3 flex h-[96px] items-end gap-[6px]"
        role="img"
        aria-label={`Finishing positions across ${summary.runs.toLocaleString(
          "en-US",
        )} simulated seasons: median ${ordinal(summary.positionP50)}, ${ordinal(
          summary.positionP5,
        )} to ${ordinal(summary.positionP95)} in 90% of seasons, playoffs in ${pct(
          summary.pPlayoffs,
        )}.`}
      >
        {summary.positionCounts.map((count, i) => {
          const position = i + 1;
          const isMedian = position === summary.positionP50;
          const share = count / max;
          return (
            <div
              key={position}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <motion.div
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : 0.35 + i * 0.025,
                  ease: EASE,
                }}
                style={{
                  height: `${Math.max(share * 100, count > 0 ? 3 : 0)}%`,
                  transformOrigin: "bottom",
                }}
                className={`w-full rounded-t-[3px] ${
                  isMedian
                    ? "bg-[var(--color-accent)]"
                    : "bg-[var(--color-accent-soft)]"
                }`}
                title={`${ordinal(position)}: ${count} of ${summary.runs} seasons`}
              />
              <span
                className={`fo-tnum text-[10px] leading-none ${
                  isMedian
                    ? "font-semibold text-[var(--color-text)]"
                    : "text-[var(--color-text-subtle)]"
                }`}
              >
                {position}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[var(--color-text-subtle)]">
        Playoffs are top four · {pct(summary.pPlayoffs)} of seasons get there
      </p>
    </div>
  );
}

function NetHistogram({
  summary,
  reduce,
}: {
  summary: MonteCarloSummary;
  reduce: boolean;
}) {
  const max = Math.max(...summary.netHistogram.map((b) => b.count), 1);
  return (
    <div>
      <p className="text-[12px] font-medium text-[var(--color-text-subtle)]">
        Where the books land
      </p>
      <div
        className="mt-3 flex h-[96px] items-end gap-[3px]"
        role="img"
        aria-label={`Net result across ${summary.runs.toLocaleString(
          "en-US",
        )} simulated seasons: median ${formatCompactMoney(
          summary.netP50,
        )}, worst 5% ${formatCompactMoney(summary.netP5)}, best 5% ${formatCompactMoney(
          summary.netP95,
        )}. Profitable in ${pct(summary.pProfit)} of seasons.`}
      >
        {summary.netHistogram.map((bin, i) => {
          const mid = (bin.start + bin.end) / 2;
          const share = bin.count / max;
          return (
            <motion.div
              key={i}
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.45,
                delay: reduce ? 0 : 0.45 + i * 0.015,
                ease: EASE,
              }}
              style={{
                height: `${Math.max(share * 100, bin.count > 0 ? 3 : 1)}%`,
                transformOrigin: "bottom",
                background:
                  mid >= 0
                    ? "rgba(63, 210, 126, 0.45)"
                    : "rgba(255, 123, 123, 0.35)",
              }}
              className="flex-1 rounded-t-[2px]"
              title={`${formatCompactMoney(bin.start)} to ${formatCompactMoney(bin.end)}: ${bin.count} seasons`}
            />
          );
        })}
      </div>
      <div className="fo-tnum mt-2 flex justify-between text-[11px] text-[var(--color-text-subtle)]">
        <span>p5 {formatCompactMoney(summary.netP5)}</span>
        <span className="text-[var(--color-text-muted)]">
          median {formatCompactMoney(summary.netP50)}
        </span>
        <span>p95 {formatCompactMoney(summary.netP95)}</span>
      </div>
    </div>
  );
}
