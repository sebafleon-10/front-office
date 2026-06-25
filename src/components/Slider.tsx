"use client";

import { type CSSProperties, useId } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  par?: number;
  parLabel?: string;
  formatValue: (n: number) => string;
  onChange: (n: number) => void;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  par,
  parLabel,
  formatValue,
  onChange,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const parPct =
    par !== undefined ? ((par - min) / (max - min)) * 100 : undefined;

  const trackStyle: CSSProperties = {
    background: `linear-gradient(
      90deg,
      var(--color-accent-muted) 0%,
      var(--color-accent-muted) ${pct}%,
      var(--color-surface-2) ${pct}%,
      var(--color-surface-2) 100%
    )`,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[var(--color-text-muted)]"
        >
          {label}
        </label>
        <span className="fo-tnum fo-tight text-[15px] font-medium text-[var(--color-text)]">
          {formatValue(value)}
        </span>
      </div>
      <div className="relative">
        {parPct !== undefined && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-[var(--color-hairline-strong)]"
            style={{ left: `${parPct}%` }}
          />
        )}
        <input
          id={id}
          type="range"
          className="fo-range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={
            {
              ...trackStyle,
              "--track": trackStyle.background,
            } as CSSProperties
          }
        />
      </div>
      {parLabel && (
        <div className="flex justify-between text-[12px] text-[var(--color-text-muted)] fo-tnum">
          <span>{parLabel}</span>
        </div>
      )}
    </div>
  );
}
