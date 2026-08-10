import { NextResponse } from "next/server";
import { buildPollState, castPollVote } from "@/lib/poll";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await buildPollState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    teamId?: string;
    matchId?: string;
  } | null;
  const matchId = (body?.matchId ?? body?.teamId)?.trim();
  if (!matchId) {
    return NextResponse.json({ error: "matchId mancante" }, { status: 400 });
  }

  const result = await castPollVote(matchId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.state);
}
