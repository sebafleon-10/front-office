"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type PresetKey } from "@/lib/assumptions";
import { runSeason, type SeasonInputs } from "@/lib/engine";
import { simulateSeasons, type MonteCarloSummary } from "@/lib/simulate";
import type { CoachRisk } from "@/lib/coach-types";
import { formatBoardPack } from "@/lib/board-pack";
import {
  DEFAULT_STATE,
  isDefaultState,
  serializeState,
} from "@/lib/url-state";
import { loadStored, saveStored, type PinnedPlan } from "@/lib/storage";
import { ControlPanel, type ControlState } from "@/components/ControlPanel";
import { OutcomeDashboard } from "@/components/OutcomeDashboard";
import { LeagueTable } from "@/components/LeagueTable";
import { PnLPanel } from "@/components/PnLPanel";
import { SeasonRunPanel } from "@/components/SeasonRunPanel";
import { ComparePanel } from "@/components/ComparePanel";
import { CopyChip } from "@/components/CopyChip";
import { CoachPanel } from "@/components/CoachPanel";
import { AboutModel } from "@/components/AboutModel";
import { BuildNotes } from "@/components/BuildNotes";
import { Hero } from "@/components/Hero";
import { SystemHero } from "@/components/SystemHero";

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

interface SeasonRun {
  key: string;
  id: number;
  summary: MonteCarloSummary;
}

interface HomeClientProps {
  initialState: ControlState;
  /** True when the URL carried plan params — those win over local storage. */
  fromUrl: boolean;
}

export function HomeClient({ initialState, fromUrl }: HomeClientProps) {
  const [state, setState] = useState<ControlState>(initialState);
  const [run, setRun] = useState<SeasonRun | null>(null);
  const [pinned, setPinned] = useState<PinnedPlan | null>(null);
  const [coachSignal, setCoachSignal] = useState(0);
  const [debrief, setDebrief] = useState<{ text: string; key: string } | null>(
    null,
  );

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

  const inputsKey = useMemo(() => JSON.stringify(inputs), [inputs]);
  const runStale = run !== null && run.key !== inputsKey;
  const activeRun = run && !runStale ? run.summary : null;

  // Restore the last session once on mount. A URL with plan params wins for
  // the levers; the pinned plan is restored either way. Deferred a tick so
  // hydration completes against the server-rendered initial state.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const t = window.setTimeout(() => {
      const stored = loadStored();
      if (!stored) return;
      if (!fromUrl && stored.state) setState(stored.state);
      if (stored.pinned) setPinned(stored.pinned);
    }, 0);
    return () => window.clearTimeout(t);
  }, [fromUrl]);

  // Keep the URL and local storage in sync with the plan (debounced; the URL
  // is written with history.replaceState so the router never re-renders).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const qs = isDefaultState(state) ? "" : `?${serializeState(state)}`;
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs}`,
      );
      saveStored({
        state,
        pinned,
        hints: loadStored()?.hints ?? {},
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [state, pinned]);

  const coachRisk = useMemo<CoachRisk | null>(() => {
    if (!activeRun) return null;
    return {
      runs: activeRun.runs,
      positionP5: activeRun.positionP5,
      positionP50: activeRun.positionP50,
      positionP95: activeRun.positionP95,
      netP5: activeRun.netP5,
      netP50: activeRun.netP50,
      netP95: activeRun.netP95,
      pPlayoffs: activeRun.pPlayoffs,
      pProfit: activeRun.pProfit,
      pBottomThree: activeRun.pBottomThree,
    };
  }, [activeRun]);

  const handleRun = () => {
    const summary = simulateSeasons(inputs);
    setRun((r) => ({ key: inputsKey, id: (r?.id ?? 0) + 1, summary }));

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("season-run")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    // Let the reveal land, then ask the coach for the board's verdict.
    window.setTimeout(() => setCoachSignal((n) => n + 1), reduce ? 100 : 1200);
  };

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
    setState(DEFAULT_STATE);
  };

  const handlePin = () => {
    if (!run || runStale) return;
    setPinned({ state, key: run.key, summary: run.summary });
  };

  const handleRestorePinned = () => {
    if (!pinned) return;
    setState(pinned.state);
    setRun((r) => ({
      key: pinned.key,
      id: (r?.id ?? 0) + 1,
      summary: pinned.summary,
    }));
  };

  const buildShareUrl = () =>
    `${window.location.origin}${window.location.pathname}?${serializeState(state)}`;

  const buildBoardPack = () =>
    formatBoardPack({
      inputs,
      result,
      summary: activeRun,
      debrief: debrief && debrief.key === inputsKey ? debrief.text : null,
      url: buildShareUrl(),
    });

  const isPinnedPlan = pinned !== null && run !== null && pinned.key === run.key;

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
                Your plan updates live — run it when you&rsquo;re ready
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
            Draft your plan. Then run the season.
          </h1>
          <p className="mt-1 max-w-[640px] text-[14px] text-[var(--color-text-muted)]">
            Everything below updates live as you move a lever — that is the
            plan on paper. When you are ready, run it through a thousand
            seasons of luck and hear the board&rsquo;s verdict.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)] xl:gap-10">
          <div className="lg:col-start-2 lg:row-start-1">
            <OutcomeDashboard result={result} risk={activeRun} />
          </div>

          <div className="lg:col-start-1 lg:row-span-4 lg:row-start-1">
            <ControlPanel
              state={state}
              controllable={result.controllable}
              overBudget={result.overBudget}
              activePreset={activePreset}
              onChange={handleChange}
              onPick={handlePick}
              onReset={handleReset}
              onRun={handleRun}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:col-start-2 lg:row-start-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <LeagueTable rows={result.table} />
            <PnLPanel result={result} />
          </div>

          <div
            id="season-run"
            style={{ scrollMarginTop: 76 }}
            className="lg:col-start-2 lg:row-start-3"
          >
            <SeasonRunPanel
              summary={run?.summary ?? null}
              stale={runStale}
              onRun={handleRun}
              runId={run?.id ?? 0}
              actions={
                <>
                  {!runStale && (
                    <button
                      type="button"
                      onClick={handlePin}
                      disabled={isPinnedPlan}
                      className="fo-btn-secondary"
                    >
                      {isPinnedPlan ? "Pinned" : "Pin this plan"}
                    </button>
                  )}
                  <CopyChip label="Copy link" getText={buildShareUrl} />
                  <CopyChip
                    label="Copy board pack"
                    getText={buildBoardPack}
                  />
                </>
              }
            />
            {pinned && (
              <ComparePanel
                pinnedSummary={pinned.summary}
                currentSummary={activeRun}
                samePlan={isPinnedPlan && !runStale}
                onRestore={handleRestorePinned}
                onClear={() => setPinned(null)}
              />
            )}
          </div>

          <div className="lg:col-start-2 lg:row-start-4">
            <CoachPanel
              inputs={inputs}
              result={result}
              risk={coachRisk}
              autoGenerate={coachSignal}
              onDebrief={(text, key) => setDebrief({ text, key })}
            />
          </div>
        </div>

        <AboutModel />

        <BuildNotes />

        <footer className="mt-16 flex flex-col gap-3 border-t border-[var(--color-hairline)] pt-6 text-[12px] text-[var(--color-text-subtle)] sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-[var(--color-text-muted)]">
              Built by Sebastian León
            </span>
            <span>
              Clubs, numbers and league are an internal model — not affiliated
              with any real league.
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <a
              href="https://github.com/sebafleon-10/front-office"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[var(--color-text)]"
            >
              GitHub
            </a>
            <a
              href="mailto:sebafleon@gmail.com"
              className="transition-colors hover:text-[var(--color-text)]"
            >
              Contact
            </a>
          </div>
        </footer>
      </main>
      </section>
    </div>
  );
}
