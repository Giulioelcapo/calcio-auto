import { adsenseClient } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** ads.txt root: formato IAB esatto per AdSense. */
export function GET() {
  const client = adsenseClient() ?? "ca-pub-4342895251465402";
  const publisher = client.replace(/^ca-/, "");
  // Commento IAB-ok: forza re-crawl quando cambia la data
  const body =
    `# Side Pitch Hub ads.txt ${new Date().toISOString().slice(0, 10)}\n` +
    `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      // text/plain senza charset: più compatibile col crawler AdSense
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
