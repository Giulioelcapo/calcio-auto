import { cookies } from "next/headers";
import { buildPollState, cookieName } from "@/lib/poll";

export async function getServerPollState() {
  const preview = await buildPollState(null);
  const jar = await cookies();
  const votedId = jar.get(cookieName(preview.dateISO))?.value ?? null;
  return buildPollState(votedId);
}
