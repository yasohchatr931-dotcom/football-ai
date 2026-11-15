import { getMatches, type Match } from "../lib/football";
export const revalidate = 60;

const FILTERS: [string, string][] = [["today","Aujourd'hui"],["tomorrow","Demain"],["week","Cette semaine"],["live","En direct"],["finished","Terminés"],["upcoming","À venir"]];
const LIVE = ["IN_PLAY","PAUSED","LIVE"];
const ymd = (d: Date) => d.toISOString().slice(0, 10);

function apply(ms: Match[], f: string, q: string) {
  const t = ymd(new Date()), tm = ymd(new Date(Date.now() + 864e5));
  let out = ms.filter(m => {
    const d = m.utcDate.slice(0, 10);
    if (f === "today") return d === t;
    if (f === "tomorrow") return d === tm;
    if (f === "live") return LIVE.includes(m.status);
    if (f === "finished") return m.status === "FINISHED";
    if (f === "upcoming") return ["SCHEDULED","TIMED"].includes(m.status);
    return d >= t;
  });
  if (q) out = out.filter(m => `${m.homeTeam.name} ${m.awayTeam.name} ${m.competition.name}`.toLowerCase().includes(q.toLowerCase()));
  return out;
}
const label = (s: string) => LIVE.includes(s) ? "EN DIRECT" : s === "FINISHED" ? "Terminé" : s === "POSTPONED" ? "Reporté" : "À venir";

export default async function Home({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  const { f = "today", q = "" } = await searchParams;
  const { matches, syncedAt, error } = await getMatches();
  const list = apply(matches, f, q);
  const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
  return (
    <div className="wrap">
      <header><div className="logo">FOOTBALL <b>AI</b></div></header>
      <section className="hero">
        <h1>Le football, expliqué par les données.</h1>
        <p>Matchs du jour, scores en direct et résultats. Information et analyse sportive uniquement : aucun pari, aucune mise.</p>
      </section>
      <form action="/" method="get">
        <input name="q" defaultValue={q} placeholder="Rechercher une équipe, un match ou une compétition" aria-label="Recherche" />
        <input type="hidden" name="f" value={f} />
        <button type="submit">Rechercher</button>
      </form>
      <nav className="tabs">{FILTERS.map(([k, n]) => <a key={k} href={`/?f=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={f === k ? "on" : ""}>{n}</a>)}</nav>
      {error && <div className="notice">{error}</div>}
      {!error && list.length === 0 && <div className="card">Aucun match pour ce filtre.</div>}
      {list.map(m => (
        <article className="card" key={m.id}>
          <div className="meta">{m.competition.name} · {fmt(m.utcDate)} · {label(m.status)}</div>
          <div className="row">
            <div className="t">{m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" />}{m.homeTeam.name}</div>
            <div className="score">{m.score.fullTime.home ?? "–"} : {m.score.fullTime.away ?? "–"}</div>
            <div className="t">{m.awayTeam.name}{m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" />}</div>
          </div>
        </article>
      ))}
      <footer>Dernière synchronisation : {fmt(syncedAt)} (heure de Paris). Données : football-data.org. Contenu informatif, sans paris.</footer>
    </div>
  );
}
