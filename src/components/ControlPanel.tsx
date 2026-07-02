"use client";

import { Card, CardTitle } from "./Card";
import { Slider } from "./Slider";
import { BudgetMeter } from "./BudgetMeter";
import { WeightingSplit } from "./WeightingSplit";
import { ScenarioPresets } from "./ScenarioPresets";
import { INPUT_RANGES, PAR_VALUES, type PresetKey } from "@/lib/assumptions";
import { formatCompactMoney, formatMoney } from "@/lib/format";

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
  return (
    <Card>
      <header className="mb-6 flex flex-col gap-1">
        <CardTitle>Season decisions</CardTitle>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Set six levers, pick a ticket price, and weight what success means.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ScenarioPresets
          onPick={onPick}
          onReset={onReset}
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
            onChange={(v) => onChange("wages", v)}
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
            onChange={(v) => onChange("academy", v)}
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
            onChange={(v) => onChange("marketing", v)}
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
            onChange={(v) => onChange("facilities", v)}
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
            onChange={(v) => onChange("commercial", v)}
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
            onChange={(v) => onChange("price", v)}
          />
        </div>

        <div className="fo-divider" aria-hidden />

        <WeightingSplit
          sportPct={state.weightSportPct}
          onChange={(v) => onChange("weightSportPct", v)}
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
