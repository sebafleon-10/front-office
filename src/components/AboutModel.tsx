import { Card, CardEyebrow, CardTitle } from "./Card";
import {
  BASE_FANBASE,
  BASE_SPONSOR,
  BUDGET,
  CAPACITY,
  CONCESSIONS_PER_HEAD,
  FIN_SCORE_SCALE,
  FIXED_OVERHEAD,
  GAMES,
  HOME,
  MATCHDAY_COST_PER_HEAD,
  MERCH_PER_FAN,
  PRIZE_STEP,
  TEAMS,
} from "@/lib/assumptions";
import { LEVERS } from "@/lib/levers";
import { formatCompactMoney, formatMoney, formatNumber } from "@/lib/format";

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]">
      {children}
    </p>
  );
}

const WORLD: { value: string; label: string }[] = [
  { value: String(TEAMS), label: "Teams in the league" },
  { value: `${GAMES} (${HOME} home)`, label: "Games per season" },
  { value: formatCompactMoney(BUDGET), label: "Front office budget" },
  { value: formatNumber(CAPACITY), label: "Stadium capacity" },
  { value: formatNumber(BASE_FANBASE), label: "Starting fanbase" },
  { value: formatCompactMoney(FIXED_OVERHEAD), label: "Fixed overhead" },
];

const CHAIN: { step: string; body: string }[] = [
  {
    step: "Money becomes quality",
    body: "Player wages set squad quality on a square-root curve, plus a capped bump from the academy. Quality is clamped to a 15–92 band.",
  },
  {
    step: "Quality becomes points",
    body: `Every quality point above 50 adds 0.03 to points-per-game. Multiplied across ${GAMES} games and rounded, that is your season total.`,
  },
  {
    step: "Points become placement",
    body: "You drop into a fixed ladder of 11 rivals (9 to 31 points). Your rank is 1 plus however many rivals finished above you — beat 31 and you are champion.",
  },
  {
    step: "Placement and books become health",
    body: "Placement sets the sport score, the net result sets the finance score, and your weighting blends the two into one club health number.",
  },
];

const LEVER_ITEMS: {
  name: string;
  par: string;
  feeds: string;
  rule: string;
  example: string;
}[] = [
  ...LEVERS.map((l) => ({
    name: l.label,
    par:
      l.key === "price"
        ? `Par $${l.par}`
        : `Par ${formatCompactMoney(l.par)}`,
    feeds: l.feeds,
    rule: l.rule,
    example: l.example,
  })),
  {
    name: "Sport vs finance weighting",
    par: "Health only",
    feeds: "Club health score",
    rule: "Health = weight_sport × sport score + weight_finance × finance score. It touches nothing in the table or the books — only the headline number.",
    example:
      "It is your definition of success. Slide it to 100% sport and a profitable mid-table season scores worse than a trophy that lost money.",
  },
];

const REVENUE: { name: string; formula: string; note: string }[] = [
  {
    name: "Matchday tickets",
    formula: `attendance × price × ${HOME} home games`,
    note: "The core gate receipts — the biggest single line for most strategies.",
  },
  {
    name: "Concessions",
    formula: `attendance × $${CONCESSIONS_PER_HEAD} a head × ${HOME}`,
    note: "Moves with the size of the crowd, not the ticket price.",
  },
  {
    name: "Sponsorship",
    formula: `${formatCompactMoney(BASE_SPONSOR)} × commercial × finish × fanbase`,
    note: "Winning and a big fanbase both pull more sponsor money on top of the base.",
  },
  {
    name: "Merchandise",
    formula: `fanbase × $${MERCH_PER_FAN} a fan × form`,
    note: "A pure fanbase play, nudged up or down by recent form.",
  },
  {
    name: "Prize money",
    formula: `(${TEAMS + 1} − placement) × ${formatCompactMoney(PRIZE_STEP)}`,
    note: `1st earns ${formatMoney(TEAMS * PRIZE_STEP)}, last earns ${formatMoney(PRIZE_STEP)} — every place is worth ${formatCompactMoney(PRIZE_STEP)}.`,
  },
  {
    name: "Player trading",
    formula: "$50K + (academy ÷ par) × $180K × (quality ÷ 50)",
    note: "Develop talent, sell it, bank the difference. The profit engine for selling clubs.",
  },
];

const COSTS: { name: string; formula: string; note: string }[] = [
  {
    name: "Front office spend",
    formula: "wages + academy + marketing + facilities + commercial",
    note: `Your five money levers added up. Capped by a ${formatCompactMoney(BUDGET)} budget — cross it and you are flagged over.`,
  },
  {
    name: "Matchday operating",
    formula: `attendance × $${MATCHDAY_COST_PER_HEAD} a head × ${HOME}`,
    note: "The cost of opening the gates, scaling with the crowd.",
  },
  {
    name: "Fixed overhead",
    formula: `${formatMoney(FIXED_OVERHEAD)} flat`,
    note: "Rent, admin, the lights. It does not move with any decision.",
  },
];

const SCORES: { name: string; range: string; body: string }[] = [
  {
    name: "Sport score",
    range: "0–100",
    body: "Purely placement. 1st is 100, last is 0, linear in between. Money never touches it directly — only where you finish.",
  },
  {
    name: "Finance score",
    range: "0–100",
    body: `Purely the net result. Break even is 50, +${formatCompactMoney(FIN_SCORE_SCALE)} is 100, −${formatCompactMoney(FIN_SCORE_SCALE)} is 0.`,
  },
  {
    name: "Club health",
    range: "0–100",
    body: "Your weighting blends the two. This is the single headline number, and the only place your sport-vs-finance preference enters the math.",
  },
];

export function AboutModel() {
  return (
    <section id="about" className="mt-16 scroll-mt-6">
      <Card>
        <header className="mb-8 max-w-[640px]">
          <CardEyebrow>About the model</CardEyebrow>
          <CardTitle className="fo-tight mt-2 text-[22px] font-semibold sm:text-[26px]">
            How every number is built
          </CardTitle>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
            Nothing here is hidden. One deterministic engine takes your eight
            decisions and walks a fixed causal chain from spend to squad to
            table to books — the same plan always produces the same season.
            The only luck in the product lives in Run the season, which
            replays this exact engine under seeded noise on form and turnout,
            rivals held fixed, to show the spread around your plan. Every
            figure below traces back to the same formulas that drive the
            panels above — move a lever and watch the whole chain re-settle.
          </p>
        </header>

        {/* The world */}
        <section className="mb-8">
          <BlockLabel>The fixed world</BlockLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WORLD.map((w) => (
              <div key={w.label} className="fo-card-inset p-4">
                <p className="fo-tnum fo-tight text-[20px] font-semibold text-[var(--color-text)]">
                  {w.value}
                </p>
                <p className="mt-1 text-[12px] text-[var(--color-text-subtle)]">
                  {w.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="fo-divider" aria-hidden />

        {/* Causal chain */}
        <section className="my-8">
          <BlockLabel>From money to placement</BlockLabel>
          <ol className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-5">
            {CHAIN.map((c, i) => (
              <li key={c.step} className="flex gap-3">
                <span className="fo-tnum mt-[1px] flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[var(--color-accent-muted)] text-[12px] font-semibold text-[var(--color-accent)]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-text)]">
                    {c.step}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                    {c.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="fo-divider" aria-hidden />

        {/* Levers */}
        <section className="my-8">
          <BlockLabel>What each decision moves</BlockLabel>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {LEVER_ITEMS.map((l) => (
              <div key={l.name} className="fo-card-inset flex flex-col p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold text-[var(--color-text)]">
                    {l.name}
                  </span>
                  <span className="fo-tnum flex-none text-[11px] text-[var(--color-text-subtle)]">
                    {l.par}
                  </span>
                </div>
                <span className="mt-2 inline-flex w-fit rounded-full bg-[var(--color-accent-soft)] px-2 py-[2px] text-[11px] font-medium text-[var(--color-accent)]">
                  Feeds {l.feeds}
                </span>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                  {l.rule}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
                  {l.example}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="fo-divider" aria-hidden />

        {/* Revenue + costs */}
        <section className="my-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <BlockLabel>Revenue, line by line</BlockLabel>
            <ul className="flex flex-col gap-4">
              {REVENUE.map((r) => (
                <li key={r.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-medium text-[var(--color-text)]">
                      {r.name}
                    </span>
                  </div>
                  <p className="fo-tnum mt-1 text-[12px] text-[var(--color-text-muted)]">
                    {r.formula}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
                    {r.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <BlockLabel>Costs, line by line</BlockLabel>
            <ul className="flex flex-col gap-4">
              {COSTS.map((c) => (
                <li key={c.name}>
                  <span className="text-[14px] font-medium text-[var(--color-text)]">
                    {c.name}
                  </span>
                  <p className="fo-tnum mt-1 text-[12px] text-[var(--color-text-muted)]">
                    {c.formula}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
                    {c.note}
                  </p>
                </li>
              ))}
            </ul>
            <div className="fo-card-inset mt-5 flex items-baseline justify-between gap-3 p-4">
              <span className="text-[14px] font-medium text-[var(--color-text)]">
                Net result
              </span>
              <span className="fo-tnum text-[13px] text-[var(--color-text-muted)]">
                total revenue − total cost
              </span>
            </div>
          </div>
        </section>

        <div className="fo-divider" aria-hidden />

        {/* Scores */}
        <section className="mt-8">
          <BlockLabel>The three scores</BlockLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCORES.map((s) => (
              <div key={s.name} className="fo-card-inset p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-semibold text-[var(--color-text)]">
                    {s.name}
                  </span>
                  <span className="fo-tnum text-[11px] text-[var(--color-text-subtle)]">
                    {s.range}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Card>
    </section>
  );
}
