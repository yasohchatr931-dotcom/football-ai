export type Match = {
  id: number; utcDate: string; status: string;
  competition: { name: string; emblem?: string };
  homeTeam: { name: string; crest?: string };
  awayTeam: { name: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
};
export type Result = { matches: Match[]; syncedAt: string; error?: string };

const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

export async function getMatches(): Promise<Result> {
  const syncedAt = new Date().toISOString();
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return { matches: [], syncedAt, error: "Clé API non configurée : aucune donnée n'est affichée." };
  try {
    const r = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${day(-1)}&dateTo=${day(7)}`, {
      headers: { "X-Auth-Token": key }, next: { revalidate: 60 },
    });
    if (!r.ok) return { matches: [], syncedAt, error: `Le fournisseur de données a répondu avec l'erreur ${r.status}.` };
    const j = await r.json();
    return { matches: j.matches ?? [], syncedAt };
  } catch {
    return { matches: [], syncedAt, error: "Le fournisseur de données est injoignable." };
  }
}
