"use client";

import { useMemo, useState } from "react";
import { PRESETS, type PresetKey } from "@/lib/assumptions";
import { runSeason, type SeasonInputs } from "@/lib/engine";
import { ControlPanel, type ControlState } from "@/components/ControlPanel";
import { OutcomeDashboard } from "@/components/OutcomeDashboard";
import { LeagueTable } from "@/components/LeagueTable";
import { PnLPanel } from "@/components/PnLPanel";
import { CoachPanel } from "@/components/CoachPanel";
import { AboutModel } from "@/components/AboutModel";
import { Hero } from "@/components/Hero";
import { SystemHero } from "@/components/SystemHero";

const INITIAL_STATE: ControlState = {
  wages: PRESETS.balanced.wages,
  academy: PRESETS.balanced.academy,
  marketing: PRESETS.balanced.marketing,
  facilities: PRESETS.balanced.facilities,
  commercial: PRESETS.balanced.commercial,
  price: PRESETS.balanced.price,
  weightSportPct: 50,
};

function presetMatches(state: ControlState): PresetKey | null {
  const keys = Object.keys(PRESETS) as PresetKey[];
  for (const key of keys) {
    const p = PRESETS[key];
    if (
      p.wages === state.wages &&
      p.academy === state.academy &&
      p.marketing === state.marketing &&
      p.facilities === state.facilities &&
      p.commercial === state.commercial &&
      p.price === state.price
    ) {
      return key;
    }
  }
  return null;
}

export default function HomePage() {
  const [state, setState] = useState<ControlState>(INITIAL_STATE);

  const inputs = useMemo<SeasonInputs>(
    () => ({
      wages: state.wages,
      academy: state.academy,
      marketing: state.marketing,
      facilities: state.facilities,
      commercial: state.commercial,
      price: state.price,
      weightSport: state.weightSportPct / 100,
      weightFinance: (100 - state.weightSportPct) / 100,
    }),
    [state],
  );

  const result = useMemo(() => runSeason(inputs), [inputs]);
  const activePreset = useMemo(() => presetMatches(state), [state]);

  const handleChange = <K extends keyof ControlState>(
    key: K,
    value: ControlState[K],
  ) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handlePick = (key: PresetKey) => {
    const p = PRESETS[key];
    setState((s) => ({
      ...s,
      wages: p.wages,
      academy: p.academy,
      marketing: p.marketing,
      facilities: p.facilities,
      commercial: p.commercial,
      price: p.price,
    }));
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
  };

  return (
    <div className="min-h-dvh">
      <Hero />

      <SystemHero
        asSection
        onEnter={(v) => setState((s) => ({ ...s, ...v }))}
      />

      <section
        id="command-center"
        style={{ scrollMarginTop: 24 }}
        aria-label="Command center"
      >
        <header className="sticky top-0 z-10 border-b border-[var(--color-hairline)] bg-[rgba(11,15,20,0.72)] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] items-baseline justify-between px-6 py-4 sm:px-10">
            <div className="flex items-baseline gap-3">
              <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
                Front Office
              </span>
              <span className="hidden text-[12px] text-[var(--color-text-subtle)] sm:inline">
                USL League Two · 2026 season
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <a
                href="#interactive-model"
                className="text-[12px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                How it works
              </a>
              <a
                href="#about"
                className="text-[12px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                About the model
              </a>
              <span className="hidden text-[12px] text-[var(--color-text-subtle)] sm:inline">
                Single season simulation
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10 sm:py-10">
        <section className="mb-6 flex flex-col gap-1">
          <p className="text-[12px] font-medium text-[var(--color-text-subtle)]">
            Command center
          </p>
          <h1 className="fo-tight text-[20px] font-semibold leading-tight text-[var(--color-text)] sm:text-[28px]">
            Set the season and read the result.
          </h1>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)] xl:gap-10">
          <div className="lg:col-start-2 lg:row-start-1">
            <OutcomeDashboard result={result} />
          </div>

          <div className="lg:col-start-1 lg:row-span-3 lg:row-start-1">
            <ControlPanel
              state={state}
              controllable={result.controllable}
              overBudget={result.overBudget}
              activePreset={activePreset}
              onChange={handleChange}
              onPick={handlePick}
              onReset={handleReset}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:col-start-2 lg:row-start-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <LeagueTable rows={result.table} />
            <PnLPanel result={result} />
          </div>

          <div className="lg:col-start-2 lg:row-start-3">
            <CoachPanel inputs={inputs} result={result} />
          </div>
        </div>

        <AboutModel />

        <footer className="mt-16 flex flex-col items-start gap-1 text-[12px] text-[var(--color-text-subtle)]">
          <span>Front Office · portfolio build</span>
          <span>
            Numbers are an internal model and not affiliated with any real
            league.
          </span>
        </footer>
      </main>
      </section>
    </div>
  );
}
