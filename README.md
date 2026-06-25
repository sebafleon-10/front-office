# Front Office

An interactive business simulation for running a lower league soccer club for one season. Set six decisions, weight what success means, and watch the league finish and full season finances respond live.

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

## Project layout

```
src/
  app/
    layout.tsx              Root layout, Inter + system font stack
    page.tsx                Command center, state owner, composes the grid
    globals.css             Tokens, base, slider styling, reduced motion
    api/coach/route.ts      Typed POST stub for the debrief
  lib/
    assumptions.ts          Every coefficient as a named constant
    engine.ts               Pure runSeason(...) -> SeasonResult
    format.ts               Money / number formatters (deterministic, tabular)
    tokens.ts               Design tokens mirror of CSS variables
    coach-types.ts          Shared request / response types for /api/coach
  components/
    AnimatedNumber.tsx      Tween between numeric values, tabular figures
    Card.tsx                Surface card primitive
    Slider.tsx              Styled native range with par marker
    ControlPanel.tsx        Six levers + weighting split + budget meter
    BudgetMeter.tsx         Capacity bar with over-budget red state
    WeightingSplit.tsx      Sport vs finance percentage split
    ScenarioPresets.tsx     Buy wins now / Develop and sell / Grow fanbase
    OutcomeDashboard.tsx    Three headline cards: position, net, health
    HealthGauge.tsx         Signature 180 degree arc gauge
    LeagueTable.tsx         Twelve clubs, Your Club row tinted
    PnLPanel.tsx            Revenue lines, cost lines, net result
    CoachPanel.tsx          Season debrief card with generate button
tests/
  engine.test.ts            Four gold scenarios + table + budget tests
```

## Engine

`lib/engine.ts` exports a single pure function:

```ts
runSeason(inputs: SeasonInputs): SeasonResult
```

`SeasonInputs` is the six controls plus the two strategy weights. `SeasonResult` is every intermediate and final value rendered on the page. The function is deterministic and side-effect free, which is why the gold scenarios pin exact points and position and close-to-the-dollar net results.

The gold scenarios in `tests/engine.test.ts` are the source of truth: any change to the engine must keep all four passing.

## Design

Dark, low-chroma terminal palette. Color is reserved for meaning: a refined blue (`#4C8DFF`) for interaction, a measured green for positive net, a measured red for negative net and the over-budget state. The Club Health gauge is the one bold element on the screen; everything else is intentionally quiet. All numbers render with tabular figures so they never shift width as they tween.

Type scale is the Apple-style 12 / 13 / 15 / 17 / 20 / 28 / 40 / 56. Spacing is on the 8-pixel grid. Card radius is 16, inner controls are 10, only the slider thumb is fully round.

`prefers-reduced-motion` swaps springs and counts for short fades. Focus rings use the accent at a clean 2 px offset.
