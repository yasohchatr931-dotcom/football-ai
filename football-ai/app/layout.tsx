import "./globals.css";
import type { Metadata } from "next";
const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: "FOOTBALL AI – Matchs, résultats et analyses football",
  description: "Matchs du jour, scores en direct et résultats de football. Plateforme d'information et d'analyse sportive, sans paris.",
  openGraph: { title: "FOOTBALL AI", description: "Matchs, résultats et analyses football.", type: "website" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>{children}</body></html>);
}
