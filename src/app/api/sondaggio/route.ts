import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildPollState,
  castPollVote,
  cookieName,
  parseVotedMap,
} from "@/lib/poll";
import type { PollSide } from "@/lib/poll-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const preview = await buildPollState({});
  const jar = await cookies();
  const votedMap = parseVotedMap(jar.get(cookieName(preview.dateISO))?.value);
  return NextResponse.json(await buildPollState(votedMap));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    matchId?: string;
    side?: PollSide;
  } | null;

  const matchId = body?.matchId?.trim();
  const side = body?.side;
  if (!matchId || (side !== "home" && side !== "away")) {
    return NextResponse.json(
      { error: "Servono matchId e side (home|away)" },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const preview = await buildPollState({});
  const votedMap = parseVotedMap(jar.get(cookieName(preview.dateISO))?.value);
  const result = await castPollVote(matchId, side, votedMap);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json(result.state);
  response.cookies.set(result.cookieKey, result.cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 36,
    secure: process.env.VERCEL === "1",
  });
  return response;
}
