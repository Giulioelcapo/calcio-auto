export type PollCandidate = {
  id: string;
  name: string;
  crest: string | null;
  leagueName: string;
  votes: number;
};

export type PollState = {
  dateISO: string;
  title: string;
  candidates: PollCandidate[];
  totalVotes: number;
  votedId: string | null;
};
