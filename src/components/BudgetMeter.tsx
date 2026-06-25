"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatCompactMoney, formatMoney } from "@/lib/format";
import { BUDGET } from "@/lib/assumptions";

interface BudgetMeterProps {
  controllable: number;
  overBudget: boolean;
}

export function BudgetMeter({ controllable, overBudget }: BudgetMeterProps) {
  const reduce = useReducedMotion();
  const pct = Math.min(100, (controllable / BUDGET) * 100);
  const fill = overBudget
    ? "var(--color-loss)"
    : "var(--color-accent)";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
          Budget used
        </span>
        <span className="fo-tnum text-[13px] text-[var(--color-text-subtle)]">
          <AnimatedNumber value={controllable} format={formatCompactMoney} />{" "}
          <span aria-hidden>/</span> {formatCompactMoney(BUDGET)}
        </span>
      </div>
      <div className="relative h-[6px] overflow-hidden rounded-full bg-[var(--color-surface-2)]">
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
      <div className="min-h-[18px] text-[12px]">
        {overBudget ? (
          <span className="text-[var(--color-loss)]">
            <span className="font-medium">Over budget.</span>{" "}
            {formatMoney(controllable - BUDGET)} above the cap. Trim spending
            to stay in the green.
          </span>
        ) : (
          <span className="text-[var(--color-text-subtle)]">
            {formatMoney(BUDGET - controllable)} of room left to spend.
          </span>
        )}
      </div>
    </div>
  );
}
