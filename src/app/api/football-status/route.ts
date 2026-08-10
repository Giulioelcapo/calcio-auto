import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function footballApiToken(): string {
  const raw = (process.env["FOOTBALL_DATA_API_TOKEN"] ?? "").trim();
  const token = (raw.split(/\r?\n/)[0] ?? "").trim();
  if (!token) return "";
  if (/upstash|https?:\/\//i.test(token)) return "";
  return token;
}

/** Diagnostica token/API senza esporre il secret. */
export async function GET() {
  const raw = (process.env["FOOTBALL_DATA_API_TOKEN"] ?? "").trim();
  const token = footballApiToken();

  if (!raw) {
    return NextResponse.json({
      configured: false,
      status: null,
      ok: false,
      hint: "FOOTBALL_DATA_API_TOKEN assente su questo ambiente",
    });
  }

  if (!token) {
    return NextResponse.json({
      configured: false,
      status: null,
      ok: false,
      hint:
        "FOOTBALL_DATA_API_TOKEN non valido: sembra contenere un URL/Upstash. Metti SOLO il token di football-data.org (una riga).",
    });
  }

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/SA",
      {
        headers: { "X-Auth-Token": token },
        cache: "no-store",
      },
    );

    return NextResponse.json({
      configured: true,
      status: res.status,
      ok: res.ok,
      tokenLooksLikeStripe: token.startsWith("sk_"),
      tokenLength: token.length,
      hint:
        res.status === 200
          ? "Token OK"
          : res.status === 403
            ? "Token/account rifiutato (403). Serve un account football-data nuovo"
            : res.status === 400
              ? "Token malformato"
              : `Errore API ${res.status}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({
      configured: true,
      status: null,
      ok: false,
      hint: `Fetch API fallita: ${message.slice(0, 160)}`,
    });
  }
}
