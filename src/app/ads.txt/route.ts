import { adsenseClient } from "@/lib/site";

export const dynamic = "force-dynamic";

/** ads.txt ufficiale: publisher ID senza prefisso ca- */
export function GET() {
  const client = adsenseClient() ?? "ca-pub-5512547544373777";
  const publisher = client.replace(/^ca-/, "");
  const body = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
