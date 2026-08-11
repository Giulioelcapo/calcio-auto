import { adsenseClient } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** ads.txt root: formato IAB esatto per AdSense. */
export function GET() {
  const client = adsenseClient() ?? "ca-pub-4342895251465402";
  const publisher = client.replace(/^ca-/, "");
  // Una sola riga + newline finale (requisito comune crawler)
  const body = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;

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
