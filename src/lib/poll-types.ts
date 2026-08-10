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
  votes: number;
};

export type PollState = {
  dateISO: string;
  title: string;
  candidates: PollCandidate[];
  totalVotes: number;
  votedId: string | null;
};
