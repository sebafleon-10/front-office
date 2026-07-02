"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="fo-card w-full max-w-md p-8 text-center">
        <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
          Front Office
        </p>
        <h1 className="fo-tight mt-3 text-[22px] font-semibold text-[var(--color-text)]">
          The season hit a snag.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
          Something went wrong rendering the club. Your decisions are safe — the
          engine is deterministic, so reloading rebuilds the exact same season.
        </p>
        {error.digest ? (
          <p className="fo-tnum mt-2 text-[11px] text-[var(--color-text-subtle)]">
            Ref {error.digest}
          </p>
        ) : null}
        <button type="button" onClick={reset} className="fo-btn-primary mt-6 px-5 py-3">
          Reload the season
        </button>
      </div>
    </main>
  );
}
