/** Stagione target: 2026/2027 (parametro API season=2026) */
export const SEASON_YEAR = 2026;
export const SEASON_LABEL = "2026/2027";

export function seasonQuery(extra = ""): string {
  const base = `season=${SEASON_YEAR}`;
  return extra ? `?${base}&${extra}` : `?${base}`;
}

export function crestUrl(teamId: number, ext: "svg" | "png" = "svg"): string {
  return `https://crests.football-data.org/${teamId}.${ext}`;
}
