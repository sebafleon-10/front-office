export const tokens = {
  color: {
    bg: "#0B0F14",
    surface1: "#14191F",
    surface2: "#1B212A",
    hairline: "rgba(255,255,255,0.08)",
    text: "#F5F7FA",
    textMuted: "#9BA6B2",
    textSubtle: "#6B7682",
    accent: "#4C8DFF",
    profit: "#3FD27E",
    loss: "#FF6B6B",
  },
  radius: {
    card: 16,
    control: 10,
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64] as const,
  duration: {
    fast: 180,
    base: 220,
    slow: 280,
    reveal: 400,
  },
  ease: "cubic-bezier(0.32,0.72,0,1)",
  spring: {
    type: "spring" as const,
    stiffness: 220,
    damping: 28,
    mass: 1,
  },
} as const;

export type Tokens = typeof tokens;
