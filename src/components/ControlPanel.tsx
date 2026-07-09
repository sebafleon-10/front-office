"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardTitle } from "./Card";
import { Slider } from "./Slider";
import { BudgetMeter } from "./BudgetMeter";
import { WeightingSplit } from "./WeightingSplit";
import { ScenarioPresets } from "./ScenarioPresets";
import { INPUT_RANGES, PAR_VALUES, type PresetKey } from "@/lib/assumptions";
import { formatCompactMoney, formatMoney } from "@/lib/format";
import { hintSeen, markHintSeen } from "@/lib/storage";

export interface ControlState {
  wages: number;
  academy: number;
  marketing: number;
  facilities: number;
  commercial: number;
  price: number;
  weightSportPct: number;
}

interface ControlPanelProps {
  state: ControlState;
  controllable: number;
  overBudget: boolean;
  activePreset: PresetKey | null;
  onChange: <K extends keyof ControlState>(key: K, value: ControlState[K]) => void;
  onPick: (key: PresetKey) => void;
  onReset: () => void;
  onRun?: () => void;
}

const formatPrice = (n: number) => `$${n}`;

export function ControlPanel({
  state,
  controllable,
  overBudget,
  activePreset,
  onChange,
  onPick,
  onReset,
  onRun,
}: ControlPanelProps) {
  // One quiet first-visit line, gone the moment they touch anything.
  const [showHint, setShowHint] = useState(false);
  const hintDismissed = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!hintSeen("cc-start")) setShowHint(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const dismissHint = useCallback(() => {
    if (hintDismissed.current) return;
    hintDismissed.current = true;
    markHintSeen("cc-start");
    setShowHint(false);
  }, []);

  const handleChange: ControlPanelProps["onChange"] = (key, value) => {
    dismissHint();
    onChange(key, value);
  };
  const handlePick = (key: PresetKey) => {
    dismissHint();
    onPick(key);
  };
  const handleReset = () => {
    dismissHint();
    onReset();
  };

  return (
    <Card>
      <header className="mb-6 flex flex-col gap-1">
        <CardTitle>Season decisions</CardTitle>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Set six levers, pick a ticket price, and weight what success means.
        </p>
        <AnimatePresence initial={false}>
          {showHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 text-[12px] text-[var(--color-accent)]"
            >
              Start by moving Player wages: everything recomputes live.
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      <div className="flex flex-col gap-6">
        <ScenarioPresets
          onPick={handlePick}
          onReset={handleReset}
          active={activePreset}
        />

        <div className="fo-divider" aria-hidden />

        <div className="flex flex-col gap-5">
          <Slider
            label="Player wages"
            value={state.wages}
            min={INPUT_RANGES.wages.min}
            max={INPUT_RANGES.wages.max}
            step={INPUT_RANGES.wages.step}
            par={PAR_VALUES.wages}
            parLabel={`Par ${formatCompactMoney(PAR_VALUES.wages)}`}
            formatValue={formatMoney}
            onChange={(v) => handleChange("wages", v)}
          />
          <Slider
            label="Academy investment"
            value={state.academy}
            min={INPUT_RANGES.academy.min}
            max={INPUT_RANGES.academy.max}
            step={INPUT_RANGES.academy.step}
            par={PAR_VALUES.academy}
            parLabel={`Par ${formatCompactMoney(PAR_VALUES.academy)}`}
            formatValue={formatMoney}
            onChange={(v) => handleChange("academy", v)}
          />
          <Slider
            label="Marketing & community"
            value={state.marketing}
            min={INPUT_RANGES.marketing.min}
            max={INPUT_RANGES.marketing.max}
            step={INPUT_RANGES.marketing.step}
            par={PAR_VALUES.marketing}
            parLabel={`Par ${formatCompactMoney(PAR_VALUES.marketing)}`}
            formatValue={formatMoney}
            onChange={(v) => handleChange("marketing", v)}
          />
          <Slider
            label="Matchday & facilities"
            value={state.facilities}
            min={INPUT_RANGES.facilities.min}
            max={INPUT_RANGES.facilities.max}
            step={INPUT_RANGES.facilities.step}
            par={PAR_VALUES.facilities}
            parLabel={`Par ${formatCompactMoney(PAR_VALUES.facilities)}`}
            formatValue={formatMoney}
            onChange={(v) => handleChange("facilities", v)}
          />
          <Slider
            label="Sponsorship sales"
            value={state.commercial}
            min={INPUT_RANGES.commercial.min}
            max={INPUT_RANGES.commercial.max}
            step={INPUT_RANGES.commercial.step}
            par={PAR_VALUES.commercial}
            parLabel={`Par ${formatCompactMoney(PAR_VALUES.commercial)}`}
            formatValue={formatMoney}
            onChange={(v) => handleChange("commercial", v)}
          />
          <Slider
            label="Ticket price"
            value={state.price}
            min={INPUT_RANGES.price.min}
            max={INPUT_RANGES.price.max}
            step={INPUT_RANGES.price.step}
            par={PAR_VALUES.price}
            parLabel={`Par $${PAR_VALUES.price}`}
            formatValue={formatPrice}
            onChange={(v) => handleChange("price", v)}
          />
        </div>

        <div className="fo-divider" aria-hidden />

        <WeightingSplit
          sportPct={state.weightSportPct}
          onChange={(v) => handleChange("weightSportPct", v)}
        />

        <div className="fo-divider" aria-hidden />

        <BudgetMeter controllable={controllable} overBudget={overBudget} />

        {onRun && (
          <>
            <div className="fo-divider" aria-hidden />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onRun}
                className="fo-btn-primary w-full px-4 py-3 text-[14px]"
              >
                Run the season
              </button>
              <p className="text-center text-[11px] text-[var(--color-text-subtle)]">
                Plays this plan through 1,000 seasons of luck
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
