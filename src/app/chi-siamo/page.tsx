import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: `Mission e progetto ${SITE_NAME}.`,
};

export default function ChiSiamoPage() {
  return (
    <LegalPage title="Chi siamo" updated="10 agosto 2026">
      <p>
        <strong>{SITE_NAME}</strong> — {SITE_TAGLINE}.
      </p>

      <h2>Cosa facciamo</h2>
      <p>
        Pubblichiamo in automatico classifiche, calendari, risultati, squadre e
        insight statistici sui principali campionati europei e internazionali
        disponibili nel piano free di football-data.org. L’obiettivo è offrire
        informazioni rapide, chiare e sempre aggiornate, ottimizzate per la
        ricerca su Google.
      </p>

      <h2>Come lavoriamo</h2>
      <ul>
        <li>Aggiornamento automatico dei dati di stagione</li>
        <li>Pagine dedicate per campionato, giornata e squadra</li>
        <li>Testi descrittivi generati da template editoriali + dati live</li>
        <li>Design mobile-first, pensato per consultazione veloce</li>
      </ul>

      <h2>Monetizzazione</h2>
      <p>
        Il sito può mostrare annunci pubblicitari (Google AdSense) per
        sostenersi. Gli annunci non influenzano i dati sportivi mostrati.
      </p>

      <h2>Trasparenza</h2>
      <p>
        Consulta{" "}
        <Link href="/privacy">Privacy</Link>,{" "}
        <Link href="/cookie">Cookie</Link> e{" "}
        <Link href="/contatti">Contatti</Link>.
      </p>
    </LegalPage>
  );
}
