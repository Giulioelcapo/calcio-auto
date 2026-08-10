import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildPollState, castPollVote, cookieName } from "@/lib/poll";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const preview = await buildPollState(null);
  const votedId = jar.get(cookieName(preview.dateISO))?.value ?? null;
  if (!votedId) return NextResponse.json(preview);
  return NextResponse.json(await buildPollState(votedId));
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

  const jar = await cookies();
  const preview = await buildPollState(null);
  const already = jar.get(cookieName(preview.dateISO))?.value ?? null;

  const result = await castPollVote(matchId, already);
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
