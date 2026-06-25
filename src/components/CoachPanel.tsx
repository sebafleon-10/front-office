"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import type { SeasonInputs, SeasonResult } from "@/lib/engine";
import type { CoachRequestBody, CoachResponseBody } from "@/lib/coach-types";

interface CoachPanelProps {
  inputs: SeasonInputs;
  result: SeasonResult;
}

export function CoachPanel({ inputs, result }: CoachPanelProps) {
  const [debrief, setDebrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const body: CoachRequestBody = { inputs, result };
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as CoachResponseBody;
      setDebrief(data.debrief);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not generate the debrief.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <header className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <CardEyebrow>Boardroom</CardEyebrow>
          <CardTitle className="mt-1">Season debrief</CardTitle>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-[10px] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-[0.98] disabled:cursor-progress disabled:opacity-70"
        >
          {loading ? "Drafting…" : debrief ? "Regenerate" : "Generate debrief"}
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-4 text-[13px] text-[var(--color-loss)]"
          >
            {error}
          </motion.p>
        ) : debrief ? (
          <motion.div
            key="debrief"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-5"
          >
            <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]">
              Memo to the front office
            </p>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-text)]">
              {debrief}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="invite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[14px] leading-relaxed text-[var(--color-text-muted)]"
          >
            Generate a written debrief on the strategy you have set. The board
            will read where the season ended, where the money went, and the
            tradeoffs you accepted.
          </motion.p>
        )}
      </AnimatePresence>
    </Card>
  );
}
