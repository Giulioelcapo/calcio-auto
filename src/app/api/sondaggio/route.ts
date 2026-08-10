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
  } | null;
  const teamId = body?.teamId?.trim();
  if (!teamId) {
    return NextResponse.json({ error: "teamId mancante" }, { status: 400 });
  }

  const result = await castPollVote(teamId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.state);
}
