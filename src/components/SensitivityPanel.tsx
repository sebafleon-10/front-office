"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import { computeMarginalImpacts } from "@/lib/sensitivity";
import { formatCompactMoney } from "@/lib/format";
import type { SeasonInputs } from "@/lib/engine";

interface SensitivityPanelProps {
  inputs: SeasonInputs;
}

/**
 * Marginal analysis at the decision point: what the next increment on each
 * lever does to this plan. Every row is a real engine re-run, so this panel
 * can never disagree with the P&L above it.
 */
export function SensitivityPanel({ inputs }: SensitivityPanelProps) {
  const reduce = useReducedMotion();
  const impacts = useMemo(() => {
    const rows = computeMarginalImpacts(inputs);
    return [...rows].sort((a, b) => b.deltaNet - a.deltaNet);
  }, [inputs]);

  const maxAbs = Math.max(...impacts.map((i) => Math.abs(i.deltaNet)), 1);

  return (
    <Card>
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <CardEyebrow>Marginal impact</CardEyebrow>
          <CardTitle className="mt-1">The next $50K</CardTitle>
        </div>
        <span className="text-[12px] text-[var(--color-text-subtle)]">
          Engine-exact, recomputed as you drag
        </span>
      </header>

      <ul className="flex flex-col gap-2">
        {impacts.map((row) => {
          const positive = row.deltaNet >= 0;
          const pct = row.atMax
            ? 0
            : Math.max((Math.abs(row.deltaNet) / maxAbs) * 100, 2);
          return (
            <li
              key={row.key}
              className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-4"
            >
              <span className="truncate text-[14px] text-[var(--color-text-muted)]">
                {row.label}
                <span className="fo-tnum ml-1.5 text-[11px] text-[var(--color-text-subtle)]">
                  {row.stepLabel}
                </span>
              </span>
              <div
                className="relative h-[6px] overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]"
                aria-hidden
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: positive
                      ? "rgba(63, 210, 126, 0.55)"
                      : "rgba(255, 123, 123, 0.45)",
                  }}
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={
                    reduce
                      ? { duration: 0.01 }
                      : { type: "spring", stiffness: 220, damping: 28, mass: 1 }
                  }
                />
              </div>
              <span className="flex items-center justify-end gap-2">
                {row.deltaPosition !== 0 && !row.atMax && (
                  <span
                    className={`fo-tnum flex-none rounded-full border px-2 py-[2px] text-[11px] font-medium ${
                      row.deltaPosition > 0
                        ? "border-[rgba(63,210,126,0.35)] text-[var(--color-profit)]"
                        : "border-[rgba(255,123,123,0.35)] text-[var(--color-loss)]"
                    }`}
                  >
                    {row.deltaPosition > 0 ? "▲" : "▼"}{" "}
                    {Math.abs(row.deltaPosition)}{" "}
                    {Math.abs(row.deltaPosition) === 1 ? "place" : "places"}
                  </span>
                )}
                {row.atMax ? (
                  <span className="text-[12px] text-[var(--color-text-subtle)]">
                    at max
                  </span>
                ) : (
                  <span
                    className={`fo-tnum min-w-[64px] text-right text-[14px] font-medium ${
                      positive
                        ? "text-[var(--color-profit)]"
                        : "text-[var(--color-loss)]"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {formatCompactMoney(row.deltaNet)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-text-subtle)]">
        What one more increment on each lever does to this exact plan — net
        result first, table movement when it happens. Past the budget cap,
        every extra dollar also pays the board&rsquo;s 12% financing.
      </p>
    </Card>
  );
}
