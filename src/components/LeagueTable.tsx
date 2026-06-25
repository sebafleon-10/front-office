"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import type { LeagueRow } from "@/lib/engine";

interface LeagueTableProps {
  rows: LeagueRow[];
}

export function LeagueTable({ rows }: LeagueTableProps) {
  return (
    <Card>
      <header className="mb-5 flex items-baseline justify-between">
        <div>
          <CardEyebrow>Standings</CardEyebrow>
          <CardTitle className="mt-1">League table</CardTitle>
        </div>
        <span className="text-[12px] text-[var(--color-text-subtle)]">
          12 clubs · {rows.length > 0 ? rows[0].points : 0} pts at top
        </span>
      </header>
      <ol className="flex flex-col">
        <AnimatePresence initial={false}>
          {rows.map((row, index) => (
            <motion.li
              key={row.name}
              layout
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="relative"
            >
              <div
                className={`relative grid grid-cols-[28px_1fr_auto] items-center gap-4 px-2 py-3 ${
                  row.isYourClub
                    ? "rounded-[10px] bg-[var(--color-accent-soft)]"
                    : ""
                }`}
              >
                {row.isYourClub && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-accent)]"
                  />
                )}
                <span className="fo-tnum text-[13px] text-[var(--color-text-subtle)]">
                  {index + 1}
                </span>
                <span
                  className={`truncate text-[15px] ${
                    row.isYourClub
                      ? "font-medium text-[var(--color-text)]"
                      : "text-[var(--color-text)]"
                  }`}
                >
                  {row.name}
                </span>
                <span className="fo-tnum text-[15px] font-medium text-[var(--color-text)]">
                  {row.points}
                </span>
              </div>
              {index < rows.length - 1 && (
                <div className="fo-divider mx-2" aria-hidden />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </Card>
  );
}
