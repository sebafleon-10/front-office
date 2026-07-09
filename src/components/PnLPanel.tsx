"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatMoney, formatMoneySigned } from "@/lib/format";
import type { SeasonResult } from "@/lib/engine";

interface PnLPanelProps {
  result: SeasonResult;
}

interface Line {
  label: string;
  value: number;
  kind: "revenue" | "cost";
  /** Render label and value in the loss color: the over-cap penalty line. */
  loss?: boolean;
}

function PnLBar({
  value,
  max,
  kind,
}: {
  value: number;
  max: number;
  kind: "revenue" | "cost";
}) {
  const reduce = useReducedMotion();
  const pct = max === 0 ? 0 : Math.min(100, (Math.abs(value) / max) * 100);
  const fill =
    kind === "revenue"
      ? "rgba(245, 247, 250, 0.18)"
      : "rgba(155, 166, 178, 0.16)";

  return (
    <div
      className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]"
      aria-hidden
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: fill }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={
          reduce
            ? { duration: 0.01 }
            : { type: "spring", stiffness: 220, damping: 28, mass: 1 }
        }
      />
    </div>
  );
}

function NetBar({ value, max }: { value: number; max: number }) {
  const reduce = useReducedMotion();
  const pct = max === 0 ? 0 : Math.min(100, (Math.abs(value) / max) * 100);
  const positive = value >= 0;
  const fill = positive ? "var(--color-profit)" : "var(--color-loss)";
  return (
    <div className="relative flex items-center">
      <div
        className="relative h-[8px] flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]"
        aria-hidden
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: fill }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={
            reduce
              ? { duration: 0.01 }
              : { type: "spring", stiffness: 220, damping: 28, mass: 1 }
          }
        />
      </div>
    </div>
  );
}

export function PnLPanel({ result }: PnLPanelProps) {
  const revenueLines: Line[] = [
    { label: "Matchday tickets", value: result.matchday, kind: "revenue" },
    { label: "Concessions", value: result.concessions, kind: "revenue" },
    { label: "Sponsorship", value: result.sponsorship, kind: "revenue" },
    { label: "Merchandise", value: result.merch, kind: "revenue" },
    { label: "Prize money", value: result.prize, kind: "revenue" },
    { label: "Player trading", value: result.playerSales, kind: "revenue" },
  ];
  const costLines: Line[] = [
    { label: "Front office spend", value: result.controllable, kind: "cost" },
    { label: "Matchday operating", value: result.matchdayCost, kind: "cost" },
    { label: "Fixed overhead", value: result.fixedOverhead, kind: "cost" },
    ...(result.financingCost > 0
      ? [
          {
            label: "Emergency financing",
            value: result.financingCost,
            kind: "cost" as const,
            loss: true,
          },
        ]
      : []),
  ];

  const maxLine = Math.max(
    ...revenueLines.map((l) => l.value),
    ...costLines.map((l) => l.value),
  );
  const maxTotal = Math.max(result.totalRevenue, result.totalCost);

  return (
    <Card>
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <CardEyebrow>Season finances</CardEyebrow>
          <CardTitle className="mt-1">Profit and loss</CardTitle>
        </div>
        <span className="text-[12px] text-[var(--color-text-subtle)]">
          Full season, 14 games
        </span>
      </header>

      <div className="flex flex-col gap-5">
        <section>
          <p className="mb-3 text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]">
            Revenue
          </p>
          <ul className="flex flex-col gap-2">
            {revenueLines.map((line) => (
              <li
                key={line.label}
                className="grid grid-cols-[1fr_2fr_auto] items-center gap-4"
              >
                <span className="text-[14px] text-[var(--color-text-muted)]">
                  {line.label}
                </span>
                <PnLBar value={line.value} max={maxLine} kind={line.kind} />
                <AnimatedNumber
                  value={line.value}
                  format={formatMoney}
                  className="fo-tnum text-[14px] font-medium text-[var(--color-text)]"
                />
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-[1fr_2fr_auto] items-baseline gap-4 border-t border-[var(--color-hairline)] pt-3">
            <span className="text-[13px] font-medium text-[var(--color-text)]">
              Total revenue
            </span>
            <div className="h-[6px] rounded-full bg-[rgba(255,255,255,0.04)]">
              <motion.div
                className="h-full rounded-full bg-[rgba(245,247,250,0.24)]"
                initial={false}
                animate={{
                  width: `${(result.totalRevenue / maxTotal) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
              />
            </div>
            <AnimatedNumber
              value={result.totalRevenue}
              format={formatMoney}
              className="fo-tnum text-[15px] font-semibold text-[var(--color-text)]"
            />
          </div>
        </section>

        <section>
          <p className="mb-3 text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]">
            Costs
          </p>
          <ul className="flex flex-col gap-2">
            {costLines.map((line) => (
              <li
                key={line.label}
                className="grid grid-cols-[1fr_2fr_auto] items-center gap-4"
              >
                <span
                  className={`text-[14px] ${
                    line.loss
                      ? "text-[var(--color-loss)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {line.label}
                </span>
                <PnLBar value={line.value} max={maxLine} kind={line.kind} />
                <AnimatedNumber
                  value={line.value}
                  format={formatMoney}
                  className={`fo-tnum text-[14px] font-medium ${
                    line.loss
                      ? "text-[var(--color-loss)]"
                      : "text-[var(--color-text)]"
                  }`}
                />
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-[1fr_2fr_auto] items-baseline gap-4 border-t border-[var(--color-hairline)] pt-3">
            <span className="text-[13px] font-medium text-[var(--color-text)]">
              Total cost
            </span>
            <div className="h-[6px] rounded-full bg-[rgba(255,255,255,0.04)]">
              <motion.div
                className="h-full rounded-full bg-[rgba(155,166,178,0.20)]"
                initial={false}
                animate={{
                  width: `${(result.totalCost / maxTotal) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
              />
            </div>
            <AnimatedNumber
              value={result.totalCost}
              format={formatMoney}
              className="fo-tnum text-[15px] font-semibold text-[var(--color-text)]"
            />
          </div>
        </section>

        <section className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-4">
          <div className="grid grid-cols-[1fr_2fr_auto] items-center gap-4">
            <span className="text-[14px] font-medium text-[var(--color-text)]">
              Net result
            </span>
            <NetBar value={result.net} max={maxTotal} />
            <AnimatedNumber
              value={result.net}
              format={formatMoneySigned}
              className={`fo-tnum fo-tight text-[17px] font-semibold ${
                result.net >= 0
                  ? "text-[var(--color-profit)]"
                  : "text-[var(--color-loss)]"
              }`}
            />
          </div>
        </section>
      </div>
    </Card>
  );
}
