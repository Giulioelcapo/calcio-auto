import { adsenseClient } from "@/lib/site";

/** File richiesto da Google AdSense dopo l’approvazione del publisher. */
export function GET() {
  const client = adsenseClient();
  const body = client
    ? `google.com, ${client}, DIRECT, f08c47fec0942fa0\n`
    : "# Aggiungi NEXT_PUBLIC_ADSENSE_CLIENT_ID su Vercel dopo l’approvazione AdSense\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
