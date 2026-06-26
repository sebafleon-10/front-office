"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardEyebrow, CardTitle } from "./Card";
import type { SeasonInputs, SeasonResult } from "@/lib/engine";
import type { CoachRequestBody } from "@/lib/coach-types";

interface CoachPanelProps {
  inputs: SeasonInputs;
  result: SeasonResult;
}

type Source = "claude" | "fallback" | null;

export function CoachPanel({ inputs, result }: CoachPanelProps) {
  const [debrief, setDebrief] = useState<string>("");
  const [source, setSource] = useState<Source>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genKey, setGenKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const key = JSON.stringify(inputs);
    setLoading(true);
    setError(null);
    setDebrief("");
    setSource(null);
    setGenKey(key);
    try {
      const body: CoachRequestBody = { inputs, result };
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const src = res.headers.get("x-coach-source");
      setSource(src === "claude" || src === "fallback" ? src : null);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setDebrief(acc);
      }
      acc += decoder.decode();
      setDebrief(acc);
      if (!acc.trim()) throw new Error("The debrief came back empty.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not generate the debrief.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(debrief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / denied) — silently no-op.
    }
  }

  const hasDebrief = debrief.trim().length > 0;
  const stale =
    hasDebrief && !loading && genKey !== null && genKey !== JSON.stringify(inputs);
  const sourceLabel =
    source === "claude"
      ? "Written live by Claude Opus 4.8"
      : source === "fallback"
        ? "Sample debrief"
        : null;

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
          className="fo-btn-primary px-4 py-2 text-[13px]"
        >
          {loading
            ? "Drafting…"
            : hasDebrief
              ? "Regenerate"
              : "Generate debrief"}
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
        ) : hasDebrief || loading ? (
          <motion.div
            key="debrief"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[10px] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]">
                Memo to the front office
                {sourceLabel && (
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-[2px] text-[10px] font-medium normal-case tracking-normal text-[var(--color-accent)]">
                    {sourceLabel}
                  </span>
                )}
              </p>
              {hasDebrief && !loading && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-none text-[11px] font-medium text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {stale && (
              <p className="mt-3 rounded-[8px] border border-[var(--color-hairline)] bg-[var(--color-surface-1)] px-3 py-2 text-[12px] text-[var(--color-text-muted)]">
                Strategy changed since this debrief — Regenerate to refresh it.
              </p>
            )}

            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-text)]">
              {debrief}
              {loading && (
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] -translate-y-[1px] animate-pulse bg-[var(--color-accent)] align-middle" />
              )}
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
            Generate a written debrief on the strategy you have set. An AI
            consultant reads where the season ended, where the money went, and
            what a different strategy would have produced — then writes the
            board&rsquo;s readout.
          </motion.p>
        )}
      </AnimatePresence>
    </Card>
  );
}
