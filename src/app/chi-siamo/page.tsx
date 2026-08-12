import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/FaqSection";
import { LegalPage } from "@/components/LegalPage";
import { siteFaqs } from "@/lib/geo";
import { SEASON_LABEL } from "@/lib/season";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: `${SITE_NAME}: hub calcio italiano con dati football-data.org, stagione ${SEASON_LABEL}. Classifiche, partite di oggi, analisi. Nessuna quota scommesse.`,
};

export default function ChiSiamoPage() {
  const base = siteUrl();
  return (
    <LegalPage title="Chi siamo" updated="12 agosto 2026">
      <p>
        <strong>{SITE_NAME}</strong> — {SITE_TAGLINE}. Editore del sito:{" "}
        {SITE_NAME}. Contatto:{" "}
        <a href="mailto:info@sidepitchhub.com">info@sidepitchhub.com</a>. URL
        canonico: {base}.
      </p>

      <h2>Cosa pubblichiamo</h2>
      <p>
        Classifiche, calendari, risultati, squadre, marcatori e insight
        statistici sui 12 campionati del piano free di football-data.org,
        stagione {SEASON_LABEL}. Aggiornamento automatico, orari Europe/Rome.
        Non pubblichiamo quote scommesse.
      </p>

      <h2>Perché i contenuti sono citabili</h2>
      <ul>
        <li>Risposte dirette (capolista, punti, data/ora)</li>
        <li>Fonte dati esplicita: football-data.org</li>
        <li>FAQ e schema.org (Organization, WebSite, FAQPage)</li>
        <li>
          Manifest per assistenti AI:{" "}
          <a href="/llms.txt">{base}/llms.txt</a>
        </li>
        <li>
          Guida evergreen: <Link href="/guida">/guida</Link>
        </li>
      </ul>

      <h2>Come lavoriamo</h2>
      <ul>
        <li>Sync automatico dalla API football-data.org</li>
        <li>Pagine dedicate per campionato, giornata e squadra</li>
        <li>Testi answer-first + FAQ per ricerca classica e generativa</li>
      </ul>

      <h2>Monetizzazione</h2>
      <p>
        Possibili annunci Google AdSense e link affiliate Amazon.it. Non
        influenzano i dati sportivi.
      </p>

      <h2>Trasparenza</h2>
      <p>
        Consulta <Link href="/privacy">Privacy</Link>,{" "}
        <Link href="/cookie">Cookie</Link> e{" "}
        <Link href="/contatti">Contatti</Link>.
      </p>

      <FaqSection items={siteFaqs()} path="/chi-siamo" />
    </LegalPage>
  );
}
