import { cookies } from "next/headers";
import {
  buildPollState,
  cookieName,
  getPollStorageMode,
  isGlobalPollStorageReady,
  parseVotedMap,
} from "@/lib/poll";

export async function getServerPollState() {
  try {
    const preview = await buildPollState({});
    const jar = await cookies();
    const votedMap = parseVotedMap(jar.get(cookieName(preview.dateISO))?.value);
    const state = await buildPollState(votedMap);
    return {
      ...state,
      storage: getPollStorageMode(),
      globalReady: isGlobalPollStorageReady(),
    };
  } catch {
    return {
      dateISO: new Date().toISOString().slice(0, 10),
      title: "Chi merita di più?",
      candidates: [],
      totalVotes: 0,
      storage: getPollStorageMode(),
      globalReady: isGlobalPollStorageReady(),
    };
  }
}
