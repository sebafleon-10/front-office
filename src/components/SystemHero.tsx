"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CAPACITY, PRESETS, type PresetKey } from "@/lib/assumptions";
import { runSeason, type SeasonInputs, type SeasonResult } from "@/lib/engine";
import { LEVERS, type LeverKey } from "@/lib/levers";
import { hintSeen, markHintSeen } from "@/lib/storage";
import {
  formatCompactMoney,
  formatMoneySigned,
  formatNumber,
  ordinal,
} from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { HealthGauge } from "./HealthGauge";

const SECTION_ID = "command-center";

type NodeId =
  | LeverKey
  | "quality"
  | "position"
  | "fanbase"
  | "attendance"
  | "net"
  | "health";

interface NodeBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

// The readable spine of the model: source -> target.
const EDGES: [NodeId, NodeId][] = [
  ["wages", "quality"],
  ["academy", "quality"],
  ["quality", "position"],
  ["marketing", "fanbase"],
  ["position", "fanbase"],
  ["facilities", "attendance"],
  ["price", "attendance"],
  ["fanbase", "attendance"],
  ["attendance", "net"],
  ["position", "net"],
  ["academy", "net"],
  ["commercial", "net"],
  ["position", "health"],
  ["net", "health"],
];

// Grid placement for the lg+ system view (5 cols x 6 rows).
const PLACEMENT: Record<NodeId, string> = {
  wages: "lg:col-start-1 lg:row-start-1",
  academy: "lg:col-start-1 lg:row-start-2",
  marketing: "lg:col-start-1 lg:row-start-3",
  facilities: "lg:col-start-1 lg:row-start-4",
  commercial: "lg:col-start-1 lg:row-start-5",
  price: "lg:col-start-1 lg:row-start-6",
  quality: "lg:col-start-2 lg:row-start-1 lg:row-span-2",
  fanbase: "lg:col-start-2 lg:row-start-3 lg:row-span-2",
  position: "lg:col-start-3 lg:row-start-1 lg:row-span-2",
  attendance: "lg:col-start-3 lg:row-start-4 lg:row-span-3",
  net: "lg:col-start-4 lg:row-start-3 lg:row-span-2",
  health: "lg:col-start-5 lg:row-start-2 lg:row-span-4",
};

const inputValue = (key: LeverKey, v: number) =>
  key === "price" ? `$${v}` : formatCompactMoney(v);

const DERIVED_DETAIL: Record<
  "quality" | "position" | "fanbase" | "attendance" | "net" | "health",
  { label: string; plain: string; formula: string }
> = {
  quality: {
    label: "Squad quality",
    plain:
      "How good the team is, 0–92, league average 50 — bought mostly with wages, topped up by the academy.",
    formula: "quality = 50 × √(wages ÷ par) + academy bump, capped at 92",
  },
  position: {
    label: "League position",
    plain:
      "Where you finish among 12 clubs — the top four make the playoffs.",
    formula: "points = round(ppg × 14), ranked against the 11-rival par ladder",
  },
  fanbase: {
    label: "Fanbase",
    plain:
      "Everyone who cares about the club — grown by marketing and by winning.",
    formula: "8,000 base, lifted by marketing spend and on-pitch success",
  },
  attendance: {
    label: "Attendance",
    plain: "How many actually come through the gate on matchday.",
    formula:
      "fanbase × conversion (facilities, price, form), capped at 6,000 seats",
  },
  net: {
    label: "Net result",
    plain: "The season's profit or loss — what the board reads first.",
    formula: "every revenue line minus every cost line — the bottom of the P&L",
  },
  health: {
    label: "Club health",
    plain:
      "One number for the whole season, blended by how you weighted sport against finance.",
    formula: "weight_sport × sport score + weight_finance × finance score",
  },
};

interface SystemHeroProps {
  className?: string;
  /** Render as a mid-page section (no top brand bar, no full-screen height). */
  asSection?: boolean;
  /** Called with the current lever values when the user enters the command center. */
  onEnter?: (values: Record<LeverKey, number>) => void;
}

export function SystemHero({
  className,
  asSection = false,
  onEnter,
}: SystemHeroProps) {
  const reduce = useReducedMotion();

  const [values, setValues] = useState<Record<LeverKey, number>>({
    wages: PRESETS.balanced.wages,
    academy: PRESETS.balanced.academy,
    marketing: PRESETS.balanced.marketing,
    facilities: PRESETS.balanced.facilities,
    commercial: PRESETS.balanced.commercial,
    price: PRESETS.balanced.price,
  });

  const inputs = useMemo<SeasonInputs>(
    () => ({
      ...values,
      weightSport: 0.5,
      weightFinance: 0.5,
    }),
    [values],
  );

  const result = useMemo<SeasonResult>(() => runSeason(inputs), [inputs]);

  const [active, setActive] = useState<NodeId | null>(null);

  const activePreset = useMemo<PresetKey | null>(() => {
    const keys = Object.keys(PRESETS) as PresetKey[];
    for (const key of keys) {
      const p = PRESETS[key];
      if (
        p.wages === values.wages &&
        p.academy === values.academy &&
        p.marketing === values.marketing &&
        p.facilities === values.facilities &&
        p.commercial === values.commercial &&
        p.price === values.price
      ) {
        return key;
      }
    }
    return null;
  }, [values]);

  // ---- node position measurement (for the SVG edge overlay) ----
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<NodeId, HTMLElement>>(new Map());
  const [boxes, setBoxes] = useState<Partial<Record<NodeId, NodeBox>>>({});
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const setNodeRef = useCallback((id: NodeId, el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const sb = stage.getBoundingClientRect();
    const next: Partial<Record<NodeId, NodeBox>> = {};
    nodeRefs.current.forEach((el, id) => {
      const b = el.getBoundingClientRect();
      next[id] = {
        cx: b.left - sb.left + b.width / 2,
        cy: b.top - sb.top + b.height / 2,
        w: b.width,
        h: b.height,
      };
    });
    setBoxes(next);
    setDims({ w: sb.width, h: sb.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    const stage = stageRef.current;
    if (stage) ro.observe(stage);
    window.addEventListener("resize", measure);
    // re-measure after fonts settle
    const t = window.setTimeout(measure, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [measure]);

  // Value text can change a node's width (e.g. $300K -> $1.2M); re-measure
  // after the DOM reflows so edges never draw from stale node positions.
  useEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [values, measure]);

  // Edges only render in the wide system view (matches the lg grid breakpoint).
  const showEdges = dims.w >= 1024;

  const connected = useMemo<Set<NodeId> | null>(() => {
    if (!active) return null;
    const s = new Set<NodeId>([active]);
    EDGES.forEach(([a, b]) => {
      if (a === active) s.add(b);
      if (b === active) s.add(a);
    });
    return s;
  }, [active]);

  const handleEnter = useCallback(() => {
    // Carry the current exploration into the command center before scrolling.
    onEnter?.(values);
    const el = document.getElementById(SECTION_ID);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [reduce, onEnter, values]);

  // First-visit nudge on the wages node — cleared the moment they interact.
  const [dragNudge, setDragNudge] = useState(false);
  const nudgeDismissed = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!hintSeen("hero-drag")) setDragNudge(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const dismissNudge = useCallback(() => {
    if (nudgeDismissed.current) return;
    nudgeDismissed.current = true;
    markHintSeen("hero-drag");
    setDragNudge(false);
  }, []);

  const setLever = useCallback(
    (key: LeverKey, v: number) => {
      dismissNudge();
      setValues((prev) => ({ ...prev, [key]: v }));
    },
    [dismissNudge],
  );

  const applyPreset = useCallback(
    (key: PresetKey) => {
      dismissNudge();
      const p = PRESETS[key];
      setValues({
        wages: p.wages,
        academy: p.academy,
        marketing: p.marketing,
        facilities: p.facilities,
        commercial: p.commercial,
        price: p.price,
      });
    },
    [dismissNudge],
  );

  // ---- entrance animation ----
  const spring = reduce
    ? { duration: 0.18 }
    : { type: "spring" as const, stiffness: 220, damping: 28, mass: 1 };

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.05,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: spring },
  };

  // ---- active node explanation ----
  const activeDetail = useMemo(() => {
    if (!active) return null;
    const lever = LEVERS.find((l) => l.key === active);
    if (lever) {
      return {
        label: lever.label,
        value: inputValue(lever.key, values[lever.key]),
        plain: lever.plain,
        formula: lever.rule,
      };
    }
    if (active in DERIVED_DETAIL) {
      const d = DERIVED_DETAIL[active as keyof typeof DERIVED_DETAIL];
      return { label: d.label, value: null, plain: d.plain, formula: d.formula };
    }
    return null;
  }, [active, values]);

  return (
    <section
      id={asSection ? "interactive-model" : undefined}
      aria-label="Front Office — interactive model"
      className={`relative isolate w-full overflow-hidden ${
        asSection
          ? "fo-pitch-stripes border-t border-[var(--color-hairline)]"
          : "flex min-h-dvh flex-col"
      } ${className ?? ""}`}
    >
      {/* ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center"
      >
        <div
          className="mt-[-120px] h-[520px] w-[820px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-glow) 0%, rgba(76,141,255,0) 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* top bar (landing only) */}
      {!asSection && (
        <div className="border-b border-[var(--color-hairline)]">
          <div className="mx-auto flex max-w-[1440px] items-baseline justify-between px-6 py-4 sm:px-10">
            <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
              Front Office
            </span>
            <span className="text-[12px] text-[var(--color-text-subtle)]">
              USL League Two · live model
            </span>
          </div>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        {...(asSection
          ? {
              whileInView: "visible" as const,
              viewport: { once: true, amount: 0.2 },
            }
          : { animate: "visible" as const })}
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 sm:px-10 ${
          asSection ? "py-16 sm:py-20" : "pt-7 pb-12 sm:pt-9 sm:pb-16"
        }`}
      >
        {/* headline */}
        <motion.div variants={item} className="max-w-[680px]">
          <p className="flex items-center gap-2 text-[12px] font-medium text-[var(--color-text-subtle)]">
            <span className="relative flex h-1.5 w-1.5">
              {!reduce && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            Live causal model
          </p>
          <h1 className="fo-tight mt-3 text-[30px] font-semibold leading-[1.05] text-[var(--color-text)] sm:text-[40px] lg:text-[46px]">
            Before you spend a dollar,
            <br />
            see how the club works.
          </h1>
          <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[var(--color-text-muted)] sm:text-[15px]">
            Drag any blue decision. Squad quality, the league table, the crowd,
            the books and club health all recompute live — off the exact
            deterministic engine that drives the command center below.
          </p>
          <p className="mt-2 max-w-[560px] text-[12px] leading-relaxed text-[var(--color-text-subtle)] lg:hidden">
            On this screen the model reads top to bottom: your six decisions
            first, then everything they drive. A larger screen draws the full
            causal map between them.
          </p>
        </motion.div>

        {/* preset chips */}
        <motion.div
          variants={item}
          className="mt-5 flex flex-wrap items-center gap-2"
        >
          {(
            [
              ["buyWinsNow", "Buy wins now"],
              ["developAndSell", "Develop & sell"],
              ["growFanbase", "Grow fanbase"],
            ] as [PresetKey, string][]
          ).map(([key, label]) => {
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                aria-pressed={isActive}
                className={`fo-btn-secondary ${
                  isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : ""
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => applyPreset("balanced")}
            aria-pressed={activePreset === "balanced"}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              activePreset === "balanced"
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
            }`}
          >
            Reset to balanced
          </button>
        </motion.div>

        {/* the stage */}
        <motion.div
          variants={item}
          ref={stageRef}
          className="relative mt-5 flex flex-col gap-3 lg:grid lg:h-[470px] lg:grid-cols-5 lg:grid-rows-6 lg:gap-x-6 lg:gap-y-2.5"
        >
          {/* edge overlay */}
          {showEdges && (
            <svg
              className="pointer-events-none absolute inset-0 hidden lg:block"
              width={dims.w}
              height={dims.h}
              viewBox={`0 0 ${dims.w} ${dims.h}`}
              aria-hidden
            >
              {EDGES.map(([a, b], i) => {
                const A = boxes[a];
                const B = boxes[b];
                if (!A || !B) return null;
                const dx = B.cx - A.cx;
                const dy = B.cy - A.cy;
                const horizontal = Math.abs(dx) >= Math.abs(dy);
                const from = horizontal
                  ? { x: A.cx + Math.sign(dx) * (A.w / 2), y: A.cy }
                  : { x: A.cx, y: A.cy + Math.sign(dy) * (A.h / 2) };
                const to = horizontal
                  ? { x: B.cx - Math.sign(dx) * (B.w / 2), y: B.cy }
                  : { x: B.cx, y: B.cy - Math.sign(dy) * (B.h / 2) };
                const d = horizontal
                  ? `M ${from.x} ${from.y} C ${from.x + dx / 2} ${from.y}, ${
                      to.x - dx / 2
                    } ${to.y}, ${to.x} ${to.y}`
                  : `M ${from.x} ${from.y} C ${from.x} ${from.y + dy / 2}, ${
                      to.x
                    } ${to.y - dy / 2}, ${to.x} ${to.y}`;
                const isActive = active != null && (a === active || b === active);
                const dimmed = active != null && !isActive;
                const baseOpacity = dimmed ? 0.07 : isActive ? 0.85 : 0.26;
                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth={isActive ? 1.75 : 1.25}
                      strokeOpacity={baseOpacity}
                    />
                    {!reduce && !dimmed && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={isActive ? 2.25 : 1.5}
                        strokeLinecap="round"
                        strokeDasharray="3 17"
                        strokeOpacity={isActive ? 0.95 : 0.5}
                        initial={{ strokeDashoffset: 20 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{
                          duration: isActive ? 0.9 : 1.4,
                          ease: "linear",
                          repeat: Infinity,
                          delay: (i % 4) * 0.2,
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* input nodes */}
          {LEVERS.map((lever) => {
            const v = values[lever.key];
            const pct = ((v - lever.min) / (lever.max - lever.min)) * 100;
            const isActive = active === lever.key;
            const isConn = connected?.has(lever.key) ?? false;
            const dimmed = active != null && !isConn;
            return (
              <div
                key={lever.key}
                ref={(el) => setNodeRef(lever.key, el)}
                onMouseEnter={() => setActive(lever.key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(lever.key)}
                onBlur={() => setActive(null)}
                className={`relative z-[1] ${PLACEMENT[lever.key]} ${
                  dimmed ? "opacity-45" : "opacity-100"
                } transition-opacity duration-200`}
              >
                <div
                  className={`fo-card-inset relative flex flex-col gap-1 overflow-hidden p-3 transition-all duration-200 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.75)] ${
                    isActive
                      ? "border-[var(--color-accent)]"
                      : isConn
                        ? "border-[var(--color-accent-muted)]"
                        : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                      {lever.short}
                    </span>
                    {dragNudge && lever.key === "wages" ? (
                      <motion.span
                        animate={reduce ? undefined : { opacity: [1, 0.5, 1] }}
                        transition={
                          reduce
                            ? undefined
                            : {
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }
                        }
                        className="rounded-full bg-[var(--color-accent)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--color-bg)]"
                      >
                        Drag me
                      </motion.span>
                    ) : (
                      <span className="rounded-full bg-[var(--color-accent-soft)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                        Input
                      </span>
                    )}
                  </div>
                  <span className="fo-tnum fo-tight text-[18px] font-semibold leading-none text-[var(--color-text)]">
                    {inputValue(lever.key, v)}
                  </span>
                  {/* fill bar */}
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-1)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* drag-anywhere control */}
                  <input
                    type="range"
                    min={lever.min}
                    max={lever.max}
                    step={lever.step}
                    value={v}
                    onChange={(e) => setLever(lever.key, Number(e.target.value))}
                    aria-label={`${lever.label}: ${inputValue(lever.key, v)}`}
                    className="fo-range absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0"
                    style={{ height: "100%" }}
                  />
                </div>
              </div>
            );
          })}

          {/* derived nodes */}
          <DerivedNode
            id="quality"
            placement={PLACEMENT.quality}
            label="Squad quality"
            badge="Squad"
            value={result.quality}
            format={(n) => formatNumber(n)}
            sub="of 92 ceiling"
            setRef={setNodeRef}
            active={active}
            connected={connected}
            onActivate={setActive}
          />
          <DerivedNode
            id="position"
            placement={PLACEMENT.position}
            label="League position"
            badge="Table"
            staticBig={ordinal(result.position)}
            sub={`${result.points} pts · ${result.positionLabel}`}
            setRef={setNodeRef}
            active={active}
            connected={connected}
            onActivate={setActive}
          />
          <DerivedNode
            id="fanbase"
            placement={PLACEMENT.fanbase}
            label="Fanbase"
            badge="Fans"
            value={result.fanbase}
            format={(n) => formatNumber(n)}
            sub="supporters"
            setRef={setNodeRef}
            active={active}
            connected={connected}
            onActivate={setActive}
          />
          <DerivedNode
            id="attendance"
            placement={PLACEMENT.attendance}
            label="Attendance"
            badge="Gate"
            value={result.attendance}
            format={(n) => formatNumber(n)}
            sub={`of ${formatNumber(CAPACITY)} seats`}
            setRef={setNodeRef}
            active={active}
            connected={connected}
            onActivate={setActive}
          />
          <DerivedNode
            id="net"
            placement={PLACEMENT.net}
            label="Net result"
            badge="P&L"
            value={result.net}
            format={(n) => formatMoneySigned(n)}
            tone={result.net >= 0 ? "profit" : "loss"}
            sub={result.net >= 0 ? "profit" : "loss"}
            setRef={setNodeRef}
            active={active}
            connected={connected}
            onActivate={setActive}
            emphasize
          />

          {/* convergence: health gauge */}
          <div
            ref={(el) => setNodeRef("health", el)}
            onMouseEnter={() => setActive("health")}
            onMouseLeave={() => setActive(null)}
            className={`relative z-[1] ${PLACEMENT.health} ${
              active != null && !(connected?.has("health") ?? false)
                ? "opacity-45"
                : "opacity-100"
            } transition-opacity duration-200`}
          >
            <div
              className={`fo-card flex h-full flex-col items-center justify-center p-4 transition-colors ${
                active === "health" ? "border-[var(--color-accent)]" : ""
              }`}
            >
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                Club health
              </span>
              <HealthGauge value={result.health} />
              <span className="mt-2 text-[11px] text-[var(--color-text-subtle)]">
                sport &amp; finance, blended
              </span>
            </div>
          </div>
        </motion.div>

        {/* active-node explanation strip */}
        <motion.div
          variants={item}
          className="fo-card-inset mt-4 flex min-h-[64px] items-center gap-4 px-4 py-3"
          aria-live="polite"
        >
          {activeDetail ? (
            <>
              <div className="flex flex-none flex-col">
                <span className="text-[12px] font-semibold text-[var(--color-text)]">
                  {activeDetail.label}
                </span>
                {activeDetail.value && (
                  <span className="fo-tnum text-[12px] text-[var(--color-accent)]">
                    {activeDetail.value}
                  </span>
                )}
              </div>
              <div className="h-8 w-px flex-none bg-[var(--color-hairline)]" />
              <div className="flex flex-col gap-[2px]">
                <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                  {activeDetail.plain}
                </p>
                <p className="fo-tnum text-[12px] leading-relaxed text-[var(--color-text-subtle)]">
                  {activeDetail.formula}
                </p>
              </div>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-[var(--color-text-subtle)]">
              Hover or focus any node to see what drives it — plain English
              first, formula included. Drag a blue input and watch the whole
              chain re-settle.
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            onClick={handleEnter}
            className="fo-btn-primary px-5 py-3 text-[14px]"
          >
            Take this strategy to the command center
          </button>
          <span className="text-[12px] text-[var(--color-text-subtle)]">
            Carries your current settings into the full controls below.
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

interface DerivedNodeProps {
  id: NodeId;
  placement: string;
  label: string;
  badge: string;
  value?: number;
  format?: (n: number) => string;
  staticBig?: string;
  sub: string;
  tone?: "profit" | "loss";
  emphasize?: boolean;
  setRef: (id: NodeId, el: HTMLElement | null) => void;
  active: NodeId | null;
  connected: Set<NodeId> | null;
  onActivate: (id: NodeId | null) => void;
}

function DerivedNode({
  id,
  placement,
  label,
  badge,
  value,
  format,
  staticBig,
  sub,
  tone,
  emphasize,
  setRef,
  active,
  connected,
  onActivate,
}: DerivedNodeProps) {
  const isActive = active === id;
  const isConn = connected?.has(id) ?? false;
  const dimmed = active != null && !isConn;
  const toneColor =
    tone === "profit"
      ? "var(--color-profit)"
      : tone === "loss"
        ? "var(--color-loss)"
        : "var(--color-text)";

  return (
    <div
      ref={(el) => setRef(id, el)}
      tabIndex={0}
      onMouseEnter={() => onActivate(id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(id)}
      onBlur={() => onActivate(null)}
      className={`relative z-[1] outline-none ${placement} ${
        dimmed ? "opacity-45" : "opacity-100"
      } transition-opacity duration-200`}
    >
      <div
        className={`${emphasize ? "fo-card" : "fo-card-inset"} flex h-full flex-col justify-center p-3 transition-all duration-200 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.75)] ${
          isActive
            ? "border-[var(--color-accent)]"
            : isConn
              ? "border-[var(--color-accent-muted)]"
              : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
            {label}
          </span>
          <span className="rounded-full border border-[var(--color-hairline-strong)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
            {badge}
          </span>
        </div>
        <div
          className="fo-tnum fo-tight mt-1 text-[22px] font-semibold leading-none"
          style={{ color: toneColor }}
        >
          {staticBig != null ? (
            staticBig
          ) : (
            <AnimatedNumber
              value={value ?? 0}
              format={format ?? ((n) => formatNumber(n))}
            />
          )}
        </div>
        <span className="mt-1 text-[11px] text-[var(--color-text-subtle)]">
          {sub}
        </span>
      </div>
    </div>
  );
}
