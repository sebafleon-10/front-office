"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

interface HealthGaugeProps {
  value: number;
}

const RADIUS = 96;
const STROKE = 14;
const round2 = (n: number) => Math.round(n * 100) / 100;
const CIRCUMFERENCE = round2(Math.PI * RADIUS);

function formatHealth(n: number) {
  return Math.round(n).toString();
}

export function HealthGauge({ value }: HealthGaugeProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = round2(CIRCUMFERENCE * (1 - clamped / 100));

  const width = 240;
  const height = 140;
  const cx = round2(width / 2);
  const cy = round2(width / 2);
  const r = round2(RADIUS);

  const startX = round2(cx - r);
  const endX = round2(cx + r);
  const arcPath = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        className="block max-w-[320px]"
        role="img"
        aria-label={`Club health ${formatHealth(clamped)} of 100`}
      >
        <defs>
          <linearGradient id="health-arc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="1" />
          </linearGradient>
          <filter id="health-glow" x="-10%" y="-10%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = Math.PI + (i / 10) * Math.PI;
            const r1 = r + 10;
            const r2 = r + 14;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x1 = round2(cx + cos * r1);
            const y1 = round2(cy + sin * r1);
            const x2 = round2(cx + cos * r2);
            const y2 = round2(cy + sin * r2);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-hairline-strong)"
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        <path
          d={arcPath}
          fill="none"
          stroke="var(--color-hairline-strong)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#health-arc)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          filter="url(#health-glow)"
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={
            reduce
              ? { duration: 0.01 }
              : { type: "spring", stiffness: 90, damping: 20, mass: 1 }
          }
        />
      </svg>

      <div className="-mt-14 flex flex-col items-center sm:-mt-16">
        <AnimatedNumber
          value={clamped}
          format={formatHealth}
          className="fo-tnum fo-tight text-[56px] font-semibold leading-none text-[var(--color-text)]"
        />
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
          out of 100
        </p>
      </div>
    </div>
  );
}
