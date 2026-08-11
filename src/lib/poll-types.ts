export type PollSide = "home" | "away";

export type PollMatchVotes = {
  home: number;
  away: number;
};

export type PollCandidate = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  leagueName: string;
  kickoff: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  votes: PollMatchVotes;
  votedSide: PollSide | null;
};

export type PollState = {
  dateISO: string;
  title: string;
  candidates: PollCandidate[];
  totalVotes: number;
  storage?: "redis" | "local-file";
  globalReady?: boolean;
  /** Diagnostica: today | upcoming + quanti match API nel pool */
  poolMode?: "today" | "upcoming";
  poolSize?: number;
}
