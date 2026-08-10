import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildPollState,
  castPollVote,
  cookieName,
  getPollStorageMode,
  isGlobalPollStorageReady,
  parseVotedMap,
} from "@/lib/poll";
import type { PollSide } from "@/lib/poll-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const preview = await buildPollState({});
    const jar = await cookies();
    const votedMap = parseVotedMap(jar.get(cookieName(preview.dateISO))?.value);
    const state = await buildPollState(votedMap);
    return NextResponse.json({
      ...state,
      storage: getPollStorageMode(),
      globalReady: isGlobalPollStorageReady(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sondaggio";
    return NextResponse.json(
      {
        error: message,
        storage: getPollStorageMode(),
        globalReady: isGlobalPollStorageReady(),
        dateISO: new Date().toISOString().slice(0, 10),
        title: "Chi merita di più?",
        candidates: [],
        totalVotes: 0,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }

    const response = NextResponse.json({
      ...result.state,
      storage: getPollStorageMode(),
      globalReady: true,
    });
    response.cookies.set(result.cookieKey, result.cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 36,
      secure: process.env.VERCEL === "1",
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore voto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
