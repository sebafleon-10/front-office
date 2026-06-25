"use client";

import { type CSSProperties, useId } from "react";

interface WeightingSplitProps {
  sportPct: number;
  onChange: (sportPct: number) => void;
}

export function WeightingSplit({ sportPct, onChange }: WeightingSplitProps) {
  const id = useId();
  const finPct = 100 - sportPct;
  const trackBg = `linear-gradient(
    90deg,
    var(--color-accent) 0%,
    var(--color-accent) ${sportPct}%,
    var(--color-surface-2) ${sportPct}%,
    var(--color-surface-2) 100%
  )`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[var(--color-text-muted)]"
        >
          Strategy weighting
        </label>
        <span className="fo-tnum text-[13px] text-[var(--color-text-subtle)]">
          Sport {sportPct}% · Finance {finPct}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="fo-range"
        min={0}
        max={100}
        step={1}
        value={sportPct}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--track": trackBg } as CSSProperties}
      />
      <div className="flex justify-between text-[12px] text-[var(--color-text-subtle)]">
        <span>More sport</span>
        <span>More finance</span>
      </div>
    </div>
  );
}
