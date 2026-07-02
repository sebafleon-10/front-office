"use client";

import { AnimatedNumber } from "./AnimatedNumber";
import { Card, CardEyebrow } from "./Card";
import { HealthGauge } from "./HealthGauge";
import { formatCompactMoney, formatMoneySigned, ordinal } from "@/lib/format";
import type { SeasonResult } from "@/lib/engine";
import type { MonteCarloSummary } from "@/lib/simulate";

interface OutcomeDashboardProps {
  result: SeasonResult;
  /** Latest season-run summary, only when it matches the current plan. */
  risk?: MonteCarloSummary | null;
}

export function OutcomeDashboard({ result, risk }: OutcomeDashboardProps) {
  const netPositive = result.net >= 0;
  const netColor = netPositive
    ? "text-[var(--color-profit)]"
    : "text-[var(--color-loss)]";
  const netSubtitle = netPositive
    ? "Cash kept after a full season of operations"
    : "Cash burned across a full season of operations";

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}
    >
      <Card className="flex flex-col justify-center">
        <CardEyebrow>Final league position</CardEyebrow>
        <div className="mt-4 flex items-baseline gap-3">
          <AnimatedNumber
            value={result.position}
            format={(n) => ordinal(Math.max(1, Math.round(n)))}
            duration={0.45}
            className="fo-tnum fo-tight text-[56px] font-bold leading-none text-[var(--color-text)]"
          />
        </div>
        <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
          {result.positionLabel} · {result.points} pts from 14 games
        </p>
        {risk && (
          <p className="fo-tnum mt-1 text-[12px] text-[var(--color-accent)]">
            {ordinal(risk.positionP5)}–{ordinal(risk.positionP95)} in 90% of{" "}
            {risk.runs.toLocaleString("en-US")} simulated seasons
          </p>
        )}
      </Card>

      <Card className="flex flex-col justify-center">
        <CardEyebrow>Net result for the season</CardEyebrow>
        <AnimatedNumber
          value={result.net}
          format={formatMoneySigned}
          className={`mt-4 block fo-tnum fo-tight text-[40px] font-semibold leading-none sm:text-[44px] ${netColor}`}
        />
        <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
          {netSubtitle}
        </p>
        {risk && (
          <p className="fo-tnum mt-1 text-[12px] text-[var(--color-accent)]">
            {formatCompactMoney(risk.netP5)} to {formatCompactMoney(risk.netP95)}{" "}
            across the middle 90% of seasons
          </p>
        )}
      </Card>

      <Card className="flex flex-col justify-center">
        <CardEyebrow>Club health</CardEyebrow>
        <div className="mt-4">
          <HealthGauge value={result.health} />
        </div>
        <p className="mt-2 text-center text-[13px] text-[var(--color-text-muted)]">
          {result.health >= 70
            ? "Strong: table and books both in shape"
            : result.health >= 50
              ? "Mixed: one of table or books is dragging"
              : "Fragile: both table and books need work"}
        </p>
      </Card>
    </div>
  );
}
