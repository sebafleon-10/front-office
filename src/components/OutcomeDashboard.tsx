"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

interface OutcomeDeltas {
  position: number;
  net: number;
  health: number;
}

const DELTA_SETTLE_MS = 1500;

/**
 * Deltas against the last settled outcome. While the user drags, changes
 * accumulate against the anchor taken before they started moving; once the
 * numbers hold still for a beat, the anchor re-bases and the chips fade.
 * Works for slider drags, presets and shared-URL loads alike — no wiring
 * to the controls needed.
 */
function useOutcomeDeltas(result: SeasonResult): OutcomeDeltas | null {
  const { position, net, health } = result;
  const anchor = useRef({ position, net, health });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deltas, setDeltas] = useState<OutcomeDeltas | null>(null);

  useEffect(() => {
    const a = anchor.current;
    const d = {
      position: position - a.position,
      net: net - a.net,
      health: health - a.health,
    };
    if (d.position === 0 && Math.abs(d.net) < 0.5 && Math.abs(d.health) < 0.5)
      return;
    setDeltas(d);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      anchor.current = { position, net, health };
      setDeltas(null);
    }, DELTA_SETTLE_MS);
  }, [position, net, health]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return deltas;
}

function DeltaChip({ text, good }: { text: string; good: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={{ opacity: 0, y: reduce ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -4 }}
      transition={{ duration: reduce ? 0.01 : 0.18 }}
      className={`fo-tnum flex-none rounded-full border px-2 py-[2px] text-[11px] font-medium ${
        good
          ? "border-[rgba(63,210,126,0.35)] text-[var(--color-profit)]"
          : "border-[rgba(255,123,123,0.35)] text-[var(--color-loss)]"
      }`}
    >
      {text}
    </motion.span>
  );
}

export function OutcomeDashboard({ result, risk }: OutcomeDashboardProps) {
  const netPositive = result.net >= 0;
  const netColor = netPositive
    ? "text-[var(--color-profit)]"
    : "text-[var(--color-loss)]";
  const netSubtitle = netPositive
    ? "Cash kept after a full season of operations"
    : "Cash burned across a full season of operations";

  const deltas = useOutcomeDeltas(result);
  const places = deltas ? Math.abs(deltas.position) : 0;
  const netDelta = deltas ? Math.round(deltas.net) : 0;
  const healthDelta = deltas ? Math.round(deltas.health) : 0;

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}
    >
      <Card className="flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <CardEyebrow>Final league position</CardEyebrow>
          <AnimatePresence>
            {deltas && deltas.position !== 0 && (
              <DeltaChip
                text={`${deltas.position < 0 ? "▲" : "▼"} ${places} ${places === 1 ? "place" : "places"}`}
                good={deltas.position < 0}
              />
            )}
          </AnimatePresence>
        </div>
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
        <div className="flex items-center justify-between gap-2">
          <CardEyebrow>Net result for the season</CardEyebrow>
          <AnimatePresence>
            {deltas && Math.abs(netDelta) >= 500 && (
              <DeltaChip
                text={`${netDelta > 0 ? "+" : ""}${formatCompactMoney(netDelta)}`}
                good={netDelta > 0}
              />
            )}
          </AnimatePresence>
        </div>
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
        <div className="flex items-center justify-between gap-2">
          <CardEyebrow>Club health</CardEyebrow>
          <AnimatePresence>
            {deltas && healthDelta !== 0 && (
              <DeltaChip
                text={`${healthDelta > 0 ? "+" : ""}${healthDelta} health`}
                good={healthDelta > 0}
              />
            )}
          </AnimatePresence>
        </div>
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
