"use client";

import { Card, CardEyebrow, CardTitle } from "./Card";
import { formatCompactMoney, ordinal } from "@/lib/format";
import type { MonteCarloSummary } from "@/lib/simulate";

interface ComparePanelProps {
  pinnedSummary: MonteCarloSummary;
  /** Current plan's summary: null until the current plan has been run. */
  currentSummary: MonteCarloSummary | null;
  /** True when the pinned plan IS the current plan. */
  samePlan: boolean;
  onRestore: () => void;
  onClear: () => void;
}

interface MetricRow {
  label: string;
  pinned: string;
  current: string | null;
  /** Positive = current better. */
  delta: number | null;
  deltaText: string | null;
}

function rows(
  pinned: MonteCarloSummary,
  current: MonteCarloSummary | null,
): MetricRow[] {
  const money = (n: number) => formatCompactMoney(Math.round(n));
  const pct = (p: number) => `${Math.round(p * 100)}%`;
  return [
    {
      label: "Median finish",
      pinned: ordinal(pinned.positionP50),
      current: current ? ordinal(current.positionP50) : null,
      delta: current ? pinned.positionP50 - current.positionP50 : null,
      deltaText: current
        ? `${Math.abs(pinned.positionP50 - current.positionP50)} place${Math.abs(pinned.positionP50 - current.positionP50) === 1 ? "" : "s"}`
        : null,
    },
    {
      label: "Median net",
      pinned: money(pinned.netP50),
      current: current ? money(current.netP50) : null,
      delta: current ? current.netP50 - pinned.netP50 : null,
      deltaText: current ? money(Math.abs(current.netP50 - pinned.netP50)) : null,
    },
    {
      label: "Playoff odds",
      pinned: pct(pinned.pPlayoffs),
      current: current ? pct(current.pPlayoffs) : null,
      delta: current ? current.pPlayoffs - pinned.pPlayoffs : null,
      deltaText: current
        ? `${Math.abs(Math.round((current.pPlayoffs - pinned.pPlayoffs) * 100))} pts`
        : null,
    },
    {
      label: "Profit odds",
      pinned: pct(pinned.pProfit),
      current: current ? pct(current.pProfit) : null,
      delta: current ? current.pProfit - pinned.pProfit : null,
      deltaText: current
        ? `${Math.abs(Math.round((current.pProfit - pinned.pProfit) * 100))} pts`
        : null,
    },
  ];
}

export function ComparePanel({
  pinnedSummary,
  currentSummary,
  samePlan,
  onRestore,
  onClear,
}: ComparePanelProps) {
  const metrics = rows(pinnedSummary, samePlan ? null : currentSummary);

  return (
    <Card className="mt-8">
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <CardEyebrow>Pinned plan</CardEyebrow>
          <CardTitle className="mt-1">Compare strategies</CardTitle>
        </div>
        <div className="flex items-baseline gap-3">
          <button
            type="button"
            onClick={onRestore}
            className="text-[12px] font-medium text-[var(--color-accent)] transition-opacity hover:opacity-80"
          >
            Restore pinned
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
          >
            Unpin
          </button>
        </div>
      </header>

      {samePlan ? (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          This is the pinned plan. Change some levers and run the season to
          compare a second strategy against it.
        </p>
      ) : !currentSummary ? (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          Run the season on the current plan to compare it against the pinned
          one.
        </p>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
        >
          {metrics.map((m) => {
            const better = (m.delta ?? 0) > 0;
            const worse = (m.delta ?? 0) < 0;
            return (
              <div
                key={m.label}
                className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                  {m.label}
                </p>
                <p className="fo-tnum mt-2 text-[13px] text-[var(--color-text-muted)]">
                  Pinned {m.pinned}
                </p>
                <p className="fo-tnum text-[13px] text-[var(--color-text)]">
                  Current {m.current}
                </p>
                {m.delta !== null && m.delta !== 0 && (
                  <p
                    className={`fo-tnum mt-2 text-[12px] font-medium ${
                      better
                        ? "text-[var(--color-profit)]"
                        : worse
                          ? "text-[var(--color-loss)]"
                          : ""
                    }`}
                  >
                    {better ? "▲" : "▼"} {m.deltaText}{" "}
                    {better ? "better" : "worse"}
                  </p>
                )}
                {m.delta === 0 && (
                  <p className="mt-2 text-[12px] text-[var(--color-text-subtle)]">
                    Even
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
