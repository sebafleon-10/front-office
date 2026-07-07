"use client";

import { useState } from "react";

interface CopyChipProps {
  label: string;
  copiedLabel?: string;
  /** Resolved at click time so the copied text is always current. */
  getText: () => string;
}

/** Small secondary action chip that copies text to the clipboard. */
export function CopyChip({ label, copiedLabel = "Copied", getText }: CopyChipProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — silently no-op, same as CoachPanel.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="fo-btn-secondary"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
