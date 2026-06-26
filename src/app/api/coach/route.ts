import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CoachRequestBody } from "@/lib/coach-types";
import { runSeason, type SeasonInputs, type SeasonResult } from "@/lib/engine";
import { PRESETS, BUDGET, TEAMS } from "@/lib/assumptions";
import {
  formatMoney,
  formatMoneySigned,
  formatNumber,
  ordinal,
} from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MODEL = "claude-opus-4-8";
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Best-effort abuse gate for the public endpoint. The hard cost ceiling is the
 * Anthropic Console monthly spend cap; this just deters scripted loops. When a
 * bucket is exceeded the caller is served the free deterministic memo instead
 * of a paid Claude call.
 */
function isRateLimited(request: Request): boolean {
  const ip = getClientIp(request);
  const perMinute = rateLimit(`ip:min:${ip}`, 5, MINUTE);
  const perDay = rateLimit(`ip:day:${ip}`, 30, DAY);
  const global = rateLimit("global:day", 300, DAY);
  return !perMinute.ok || !perDay.ok || !global.ok;
}

const SYSTEM_PROMPT = `You are a strategy consultant running the post-season debrief for "Front Office", a single-season simulation of a lower-league soccer club. Your reader is the executive who set this season's strategy; address them as "you".

The numbers you are given come from a deterministic financial engine, validated to the dollar against an underlying spreadsheet model — they are exact, not estimates. Ground every claim in the figures provided. Never invent a number, a revenue line, or a counterfactual that is not in the brief.

Your job mirrors what a simulation facilitator does after a leadership exercise: name the strategy the executive actually ran, make the central tradeoff impossible to miss, and show what a different strategy would have produced from the same season — using the alternative-strategy figures in the brief.

Voice: senior, sharp, specific. Like a partner who respects the reader's time. No cheerleading, no hedging, no filler.

Format: 3 short paragraphs, roughly 150–200 words total. Plain prose only — no headings, no bullet points, no markdown. Respond with the debrief itself and nothing else: no preamble ("Here is..."), no sign-off, no commentary about your process.`;

function isValid(body: unknown): body is CoachRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const inputs = b.inputs as Record<string, unknown> | null | undefined;
  const result = b.result as Record<string, unknown> | null | undefined;
  return (
    typeof inputs === "object" &&
    inputs !== null &&
    typeof inputs.wages === "number" &&
    typeof inputs.price === "number" &&
    typeof inputs.weightSport === "number" &&
    typeof result === "object" &&
    result !== null &&
    typeof result.position === "number" &&
    typeof result.net === "number"
  );
}

/**
 * Re-run the four strategy archetypes under the executive's own sport/finance
 * weighting, so the "road not taken" figures are engine-exact and comparable.
 */
function counterfactuals(inputs: SeasonInputs): string {
  const keys = Object.keys(PRESETS) as (keyof typeof PRESETS)[];
  return keys
    .map((key) => {
      const p = PRESETS[key];
      const alt = runSeason({
        wages: p.wages,
        academy: p.academy,
        marketing: p.marketing,
        facilities: p.facilities,
        commercial: p.commercial,
        price: p.price,
        weightSport: inputs.weightSport,
        weightFinance: inputs.weightFinance,
      });
      return `- ${p.name}: ${ordinal(alt.position)} place, net ${formatMoneySigned(
        alt.net,
      )}, club health ${Math.round(alt.health)}/100`;
    })
    .join("\n");
}

function buildContext(inputs: SeasonInputs, result: SeasonResult): string {
  const sportPct = Math.round(inputs.weightSport * 100);
  const financePct = Math.round(inputs.weightFinance * 100);

  return `THE SEASON THE EXECUTIVE RAN

Decisions (front-office spend and pricing):
- Player wages: ${formatMoney(inputs.wages)}
- Academy investment: ${formatMoney(inputs.academy)}
- Marketing: ${formatMoney(inputs.marketing)}
- Facilities: ${formatMoney(inputs.facilities)}
- Commercial team: ${formatMoney(inputs.commercial)}
- Ticket price: $${inputs.price}
- Total controllable spend: ${formatMoney(result.controllable)} of a ${formatMoney(
    BUDGET,
  )} budget${result.overBudget ? " (OVER BUDGET)" : ""}
- Success weighting: ${sportPct}% sporting / ${financePct}% financial

On the pitch:
- Squad quality: ${formatNumber(result.quality)} (league average is 50)
- Points: ${result.points} -> finished ${ordinal(result.position)} of ${TEAMS} (${result.positionLabel})
- Attendance: ${formatNumber(result.attendance)} per game (6,000-seat ground)
- Fanbase: ${formatNumber(result.fanbase)}

The books (season profit & loss):
- Matchday tickets: ${formatMoney(result.matchday)}
- Concessions: ${formatMoney(result.concessions)}
- Sponsorship: ${formatMoney(result.sponsorship)}
- Merchandise: ${formatMoney(result.merch)}
- Prize money: ${formatMoney(result.prize)}
- Player trading: ${formatMoney(result.playerSales)}
- Total revenue: ${formatMoney(result.totalRevenue)}
- Total cost: ${formatMoney(result.totalCost)}
- NET RESULT: ${formatMoneySigned(result.net)}

Scores (0-100):
- Sport score: ${Math.round(result.sportScore)}
- Finance score: ${Math.round(result.finScore)}
- Club health (the weighting applied): ${Math.round(result.health)}

THE ROAD NOT TAKEN
What each reference strategy would have produced from this same season, under the executive's own ${sportPct}/${financePct} weighting:
${counterfactuals(inputs)}

Write the debrief.`;
}

/** Deterministic fallback used when no API key is configured or the model call fails. */
function buildFallbackBrief(inputs: SeasonInputs, result: SeasonResult): string {
  const wageShare = result.controllable
    ? Math.round((inputs.wages / result.controllable) * 100)
    : 0;
  const priceNote =
    inputs.price >= 22
      ? "premium pricing"
      : inputs.price <= 14
        ? "loss-leader pricing"
        : "mid-market pricing";

  return [
    `You finished ${ordinal(result.position)} in a ${TEAMS}-team table with ${result.points} points and a net result of ${formatMoneySigned(result.net)}.`,
    `Wages absorbed ${wageShare}% of the ${formatMoney(result.controllable)} you put through the front office, and you ran ${priceNote} at $${inputs.price}. Sponsorship landed at ${formatMoney(result.sponsorship)} and player trading delivered ${formatMoney(result.playerSales)}.`,
    `The story of the year is the tradeoff between table finish and cash on hand — the lesson the board will want to talk through next. Set an API key to have Claude write a fuller debrief.`,
  ].join("\n\n");
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValid(parsed)) {
    return NextResponse.json(
      { error: "Body must include inputs and result." },
      { status: 400 },
    );
  }

  const { inputs, result } = parsed;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const encoder = new TextEncoder();

  // Over the abuse limit: serve the free deterministic memo, no paid call.
  if (isRateLimited(request)) {
    return new Response(buildFallbackBrief(inputs, result), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-coach-source": "fallback",
        "x-coach-limit": "1",
      },
    });
  }

  // No key configured: stream the deterministic memo so the demo still works.
  if (!apiKey) {
    return new Response(buildFallbackBrief(inputs, result), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-coach-source": "fallback",
      },
    });
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wroteAny = false;
      try {
        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildContext(inputs, result) }],
        });

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
            wroteAny = true;
          }
        }
      } catch {
        if (!wroteAny) {
          // Failure before any output -> fall back so the user still gets a memo.
          controller.enqueue(encoder.encode(buildFallbackBrief(inputs, result)));
        } else {
          // Failure mid-stream -> mark the partial as interrupted rather than
          // leaving a silent half-debrief.
          controller.enqueue(
            encoder.encode(
              "\n\n(The live debrief was interrupted — press Regenerate to retry.)",
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-coach-source": "claude",
    },
  });
}
