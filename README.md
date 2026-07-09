# Front Office

An interactive business simulation for running a lower-league soccer club for one season. Set six decisions, weight what success means, and watch the league finish and full season finances respond live — then replay the plan through 1,000 seasons of luck and have an AI coach debrief the strategy.

**Live demo:** [sebafleon-front-office.vercel.app](https://sebafleon-front-office.vercel.app/)

## Run it

```bash
npm install
npm run dev   # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build (Turbopack)
npm run start       # serve the production build
npm test            # vitest gold scenarios + sanity checks
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

The AI debrief calls Claude when `ANTHROPIC_API_KEY` is set (see `.env.example`); without a key it degrades to a deterministic sample memo, so the demo never breaks.

## Project layout

```
src/
  app/
    layout.tsx              Root layout, metadata, OG image origin resolution
    page.tsx                Server entry — parses plan params from the URL into HomeClient
    globals.css             Tokens, base styles, slider styling, reduced motion
    api/coach/route.ts      Streaming Claude debrief: rate limits + deterministic fallback
  lib/
    assumptions.ts          Every coefficient as a named, documented constant
    engine.ts               Pure runSeason(inputs, shocks?) -> SeasonResult
    simulate.ts             Seeded Monte Carlo layer — 1,000 seasons, percentiles, histograms
    levers.ts               Lever metadata: plain-English meaning, formula, worked example
    format.ts               Money / number formatters (deterministic, tabular)
    board-pack.ts           Plain-text season summary for the clipboard
    url-state.ts            Shareable plan URLs (?w=…&a=…)
    storage.ts              Local persistence for the session + one-time hint flags
    rate-limit.ts           Per-IP and global limits for the coach endpoint
    coach-types.ts          Shared request / response types for /api/coach
  components/
    HomeClient.tsx          State owner — composes hero, model, command center, finale
    Hero.tsx                Opening hero that frames the product
    SystemHero.tsx          Interactive causal graph — drag a lever, watch the chain settle
    ControlPanel.tsx        Six levers + weighting split + budget meter + run button
    Slider.tsx              Styled native range with par marker
    WeightingSplit.tsx      Sport vs finance percentage split
    ScenarioPresets.tsx     Buy wins now / Develop and sell / Grow fanbase
    BudgetMeter.tsx         Capacity bar; names the financing cost when over the cap
    OutcomeDashboard.tsx    Three headline cards with transient delta chips on lever moves
    HealthGauge.tsx         Signature 180-degree arc gauge
    LeagueTable.tsx         Twelve clubs, playoff line under 4th, Your Club row tinted
    PnLPanel.tsx            Revenue and cost lines, incl. emergency financing when over cap
    SeasonRunPanel.tsx      Monte Carlo results — histograms, odds, pin / share actions
    ComparePanel.tsx        Pinned plan vs current plan, line by line
    CoachPanel.tsx          Streaming season debrief with sample-memo fallback
    AboutModel.tsx          Every formula in plain English, plus what the model deliberately ignores
    BuildNotes.tsx          How it was built and validated
    Card.tsx                Surface card primitive
    AnimatedNumber.tsx      Tween between numeric values, tabular figures
    CopyChip.tsx            Copy-to-clipboard chip
tests/
  engine.test.ts            Gold scenarios (incl. the over-cap financing pin) + boundary checks
  simulate.test.ts          Seeded Monte Carlo golds + rival-variance checks
  board-pack.test.ts        Clipboard board-pack contents
  rate-limit.test.ts        Coach endpoint limits
```

## Engine

`lib/engine.ts` exports a single pure function:

```ts
runSeason(inputs: SeasonInputs, shocks?: SeasonShocks): SeasonResult
```

`SeasonInputs` is the six controls plus the two strategy weights. `SeasonResult` is every intermediate and final value rendered on the page. With no shocks the function is deterministic and side-effect free, which is why the gold scenarios pin exact points, position, and close-to-the-dollar net results. Spending past the $1.2M budget is allowed but not free: the excess is charged 12% emergency financing as its own P&L line, and one gold scenario pins that penalty to the dollar.

The gold scenarios in `tests/engine.test.ts` are the source of truth: any change to the engine must keep them all passing.

## The Monte Carlo layer

`lib/simulate.ts` replays the same plan across 1,000 seasons of seeded luck. `SeasonShocks` is the only doorway between the two layers: the engine stays pure, and the simulate layer draws normal shocks for your club's form and turnout — and for every rival's season total, so the whole table shares the same luck distribution rather than standing still. Zero shocks reproduce the deterministic engine bit for bit (a gold test pins that invariance), and the seeded distribution itself is pinned: same plan, same seed, same percentiles, every run.

## Design

Dark, low-chroma terminal palette. Color is reserved for meaning: a refined blue (`#4C8DFF`) for interaction, a measured green for positive net, a measured red for negative net, the over-budget state, and the financing line it creates. The Club Health gauge is the one bold element on the screen; everything else is intentionally quiet. All numbers render with tabular figures so they never shift width as they tween.

Every explainer leads with the business meaning and keeps the formula visible underneath — the math is the proof, not the pitch. Type scale is the Apple-style 12 / 13 / 15 / 17 / 20 / 28 / 40 / 56. Spacing is on the 8-pixel grid. Card radius is 16, inner controls are 10, only the slider thumb is fully round.

`prefers-reduced-motion` swaps springs, counts, and pulses for short fades. Focus rings use the accent at a clean 2 px offset.
