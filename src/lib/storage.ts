import type { ControlState } from "@/components/ControlPanel";
import type { MonteCarloSummary } from "./simulate";

/**
 * Local persistence: a refresh keeps the plan you were working on. A URL with
 * state params always wins over storage (links must open exactly as sent).
 * Every access is wrapped — private browsing or blocked storage degrades to
 * a stateless page, never a crash.
 */

const KEY = "fo-state-v1";

export interface PinnedPlan {
  state: ControlState;
  key: string;
  summary: MonteCarloSummary;
}

export interface StoredSession {
  state: ControlState;
  pinned: PinnedPlan | null;
  hints: Record<string, boolean>;
}

export function loadStored(): StoredSession | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed || typeof parsed !== "object" || !parsed.state) return null;
    return {
      state: parsed.state,
      pinned: parsed.pinned ?? null,
      hints: parsed.hints ?? {},
    };
  } catch {
    return null;
  }
}

export function saveStored(session: StoredSession): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — nothing to do.
  }
}

export function hintSeen(name: string): boolean {
  return loadStored()?.hints[name] === true;
}

export function markHintSeen(name: string): void {
  const current = loadStored();
  if (!current) return;
  saveStored({ ...current, hints: { ...current.hints, [name]: true } });
}
