import { Card, CardEyebrow, CardTitle } from "./Card";

/**
 * The closing section: how the thing was actually built. Prose-forward on
 * purpose: this is the part of the page that answers "is this real?"
 */
export function BuildNotes() {
  return (
    <section id="build-notes" className="mt-16 scroll-mt-6">
      <Card>
        <header className="mb-8 max-w-[640px]">
          <CardEyebrow>How it&rsquo;s built</CardEyebrow>
          <CardTitle className="fo-tight mt-2 text-[22px] font-semibold sm:text-[26px]">
            The spreadsheet came first.
          </CardTitle>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                Excel first, validated to the dollar
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
                The club&rsquo;s economics started life as a financial model in
                Excel, with the causal chain wired as live formulas. The engine
                behind this page is that model ported to a pure TypeScript
                function, and a gold set of unit tests asserts the port
                reproduces the spreadsheet to the dollar across four reference
                strategies, plus every boundary the model can hit. The playable
                app and the spreadsheet tell the exact same story.
              </p>
            </div>

            <div className="fo-card-inset p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                Pinned in the test suite
              </p>
              <pre className="fo-tnum mt-2 overflow-x-auto text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                {`Balanced          6th   net -$74,973   ±$0.50
Buy wins now      4th   net -$260,686  ±$0.50
Develop and sell  5th   net +$90,660   ±$0.50
Grow fanbase      6th   net -$54,876   ±$0.50`}
              </pre>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                Deterministic core, probabilistic shell
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
                Run the season layers seeded Monte Carlo noise (form, turnout
                and every rival&rsquo;s season, a thousand replays) on top of
                the untouched engine.
                Zero noise reproduces the deterministic season bit for bit,
                and the seeded distribution itself is pinned by tests. The
                layering is deliberate: reasoning on top, deterministic code
                underneath, because when a model hand-waves every step the
                errors compound fast.
              </p>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[var(--color-text)]">
                A coach that only speaks from the numbers
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
                The season debrief is a live streamed Claude call. Before it
                writes a word, the server re-runs all four reference
                strategies through the engine under your own sport-to-finance
                weighting, so every counterfactual in the memo is
                engine-exact: the model is instructed to never invent a
                number that isn&rsquo;t in the brief. No API key configured?
                The app degrades to a deterministic memo, so the demo never
                breaks.
              </p>
            </div>

            <p className="text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
              Built as a working answer to a question I care about: what does
              it take to make a business model something a decision-maker can
              feel?
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
