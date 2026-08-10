import { cookies } from "next/headers";
import { buildPollState, cookieName, parseVotedMap } from "@/lib/poll";

export async function getServerPollState() {
  const preview = await buildPollState({});
  const jar = await cookies();
  const votedMap = parseVotedMap(jar.get(cookieName(preview.dateISO))?.value);
  return buildPollState(votedMap);
}
