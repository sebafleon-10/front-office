"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useCallback } from "react";

const SECTION_ID = "command-center";

export function Hero() {
  const reduce = useReducedMotion();

  const handleEnter = useCallback(() => {
    const el = document.getElementById(SECTION_ID);
    if (!el) return;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [reduce]);

  const spring = reduce
    ? { duration: 0.18 }
    : { type: "spring" as const, stiffness: 220, damping: 28, mass: 1 };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.04,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: spring },
  };

  const shotVariants: Variants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.985 },
    visible: { opacity: 1, scale: 1, transition: spring },
  };

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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid w-full flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
        >
          <div className="flex flex-col gap-6">
            <motion.p
              variants={itemVariants}
              className="text-[12px] font-medium text-[var(--color-text-subtle)]"
            >
              Lower league club simulation
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="fo-tight text-[40px] font-semibold leading-[1.04] text-[var(--color-text)] sm:text-[56px] lg:text-[64px] xl:text-[72px]"
            >
              Climb the table.
              <br />
              Turn a profit.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-[520px] text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[17px]"
            >
              Run a lower league club for a single season. Set six decisions,
              then see where you finish and what it cost.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="button"
                onClick={handleEnter}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--color-accent)] px-5 py-3 text-[14px] font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-[0.98]"
              >
                Enter the command center
              </button>
            </motion.div>
          </div>

          <motion.div
            variants={shotVariants}
            className="relative flex justify-center lg:justify-end"
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
                sizes="(max-width: 1024px) 90vw, 720px"
                className="block h-auto w-full"
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleEnter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduce
              ? { duration: 0.18 }
              : { duration: 0.28, delay: 0.4, ease: [0.32, 0.72, 0, 1] }
          }
          className="mt-12 inline-flex items-center gap-2 text-[12px] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-muted)]"
          aria-label="Scroll to the command center"
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
        </motion.button>
      </div>
    </section>
  );
}
