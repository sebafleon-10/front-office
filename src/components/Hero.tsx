"use client";

import Image from "next/image";
import { useCallback } from "react";

const SECTION_ID = "interactive-model";

/* Entrance animation is pure CSS (see .hero-enter* in globals.css) so the
   hero is visible at first paint instead of waiting for hydration. */
export function Hero() {
  const handleEnter = useCallback(() => {
    const el = document.getElementById(SECTION_ID);
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const stagger = (i: number) => ({ animationDelay: `${0.05 + i * 0.04}s` });

  return (
    <section
      aria-label="Front Office introduction"
      className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden"
    >
      <div className="border-b border-[var(--color-hairline)]">
        <div className="mx-auto flex max-w-[1440px] items-baseline justify-between px-6 py-4 sm:px-10">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
            Front Office
          </span>
          <span className="text-[12px] text-[var(--color-text-subtle)]">
            USL League Two season simulation
          </span>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center px-6 pt-12 pb-16 sm:px-10 sm:pt-20 sm:pb-24">
        <div className="grid w-full flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <p
              className="hero-enter text-[12px] font-medium text-[var(--color-text-subtle)]"
              style={stagger(0)}
            >
              You&rsquo;ve just been named General Manager of Meridian FC
            </p>

            <h1
              className="hero-enter fo-tight text-[40px] font-semibold leading-[1.04] text-[var(--color-text)] sm:text-[56px] lg:text-[64px] xl:text-[72px]"
              style={stagger(1)}
            >
              Climb the table.
              <br />
              Turn a profit.
            </h1>

            <p
              className="hero-enter max-w-[520px] text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[17px]"
              style={stagger(2)}
            >
              The board hands you $1.2M and one season. Six decisions decide
              where you finish and whether the books survive it, and the
              board is watching both.
            </p>

            <div className="hero-enter mt-2" style={stagger(3)}>
              <button
                type="button"
                onClick={handleEnter}
                className="fo-btn-primary px-5 py-3 text-[14px]"
              >
                See how it works
              </button>
            </div>
          </div>

          <div
            className="hero-enter-shot relative flex justify-center lg:justify-end"
            style={stagger(2)}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
            >
              <div
                className="h-[420px] w-[420px] rounded-full sm:h-[560px] sm:w-[560px]"
                style={{
                  background:
                    "radial-gradient(circle, var(--color-accent-glow) 0%, rgba(76,141,255,0) 70%)",
                  filter: "blur(40px)",
                }}
              />
            </div>

            <div className="hero-shot fo-card relative overflow-hidden p-0">
              <Image
                src="/hero-command-center.png"
                alt="Front Office command center showing controls, league table, and season finances"
                width={1600}
                height={1100}
                priority
                sizes="(max-width: 1024px) 90vw, 1440px"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          className="hero-enter-late mt-12 inline-flex items-center gap-2 text-[12px] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-muted)]"
          aria-label="Scroll to the interactive model"
        >
          More below
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
