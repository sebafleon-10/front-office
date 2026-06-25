import { NextResponse } from "next/server";
import type { CoachRequestBody, CoachResponseBody } from "@/lib/coach-types";
import { formatMoney, formatMoneySigned } from "@/lib/format";

export const runtime = "nodejs";

function isValid(body: unknown): body is CoachRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.inputs === "object" &&
    b.inputs !== null &&
    typeof b.result === "object" &&
    b.result !== null
  );
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!isValid(parsed)) {
    return NextResponse.json(
      { error: "Body must include inputs and result." },
      { status: 400 },
    );
  }

  const { inputs, result } = parsed;
  const wageShare = result.controllable
    ? Math.round((inputs.wages / result.controllable) * 100)
    : 0;
  const directionalPriceNote =
    inputs.price >= 22
      ? "premium pricing"
      : inputs.price <= 14
        ? "loss-leader pricing"
        : "mid-market pricing";

  const body: CoachResponseBody = {
    debrief: [
      `You finished ${result.position} in a 12 team table with ${result.points} points and a net result of ${formatMoneySigned(result.net)}.`,
      `Wages absorbed ${wageShare}% of the ${formatMoney(result.controllable)} you put through the front office, and you ran ${directionalPriceNote} at $${inputs.price}.`,
      `Sponsorship landed at ${formatMoney(result.sponsorship)} and player trading delivered ${formatMoney(result.playerSales)}. The story of the year is the tradeoff between table finish and cash on hand, which is the lesson the board will want to talk through next.`,
    ].join("\n\n"),
  };

  return NextResponse.json(body satisfies CoachResponseBody);
}
