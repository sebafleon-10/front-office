"use client";

import { PRESETS, type PresetKey } from "@/lib/assumptions";

interface ScenarioPresetsProps {
  onPick: (key: PresetKey) => void;
  onReset: () => void;
  active?: PresetKey | null;
}

const PRESET_ORDER: PresetKey[] = [
  "buyWinsNow",
  "developAndSell",
  "growFanbase",
];

export function ScenarioPresets({
  onPick,
  onReset,
  active = null,
}: ScenarioPresetsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
          Scenario presets
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] font-medium text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
        >
          Reset to balanced
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PRESET_ORDER.map((key) => {
          const preset = PRESETS[key];
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className={`group relative rounded-[10px] border px-3 py-2.5 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                  : "border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-hairline-strong)] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <span className="block text-[13px] font-medium leading-tight">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
