import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Informativa cookie di ${SITE_NAME}.`,
};

export default function CookiePage() {
  return (
    <LegalPage title="Cookie Policy" updated="13 agosto 2026">
      <p>
        Questa pagina spiega come <strong>{SITE_NAME}</strong> usa i cookie e
        tecnologie simili.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo salvati sul dispositivo. Servono a
        far funzionare il sito, ricordare preferenze e (con consenso) mostrare
        annunci o misurare le visite.
      </p>

      <h2>2. Tipologie usate</h2>
      <ul>
        <li>
          <strong>Tecnici / necessari:</strong> funzionamento del sito e
          memorizzazione della scelta cookie.
        </li>
        <li>
          <strong>Analitici (Google Analytics 4):</strong> con consenso, per
          misurare visite e pagine viste in forma aggregata (IP anonimizzato).
        </li>
        <li>
          <strong>Pubblicitari (Google AdSense):</strong> per mostrare annunci;
          possono essere personalizzati o non personalizzati in base al
          consenso.
        </li>
      </ul>

      <h2>3. Come gestire i cookie</h2>
      <p>
        Al primo accesso puoi accettare o rifiutare i cookie non necessari dal
        banner. Puoi anche cancellare i cookie dalle impostazioni del browser.
        Per gli annunci Google:{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Impostazioni annunci Google
        </a>
        .
      </p>

      <h2>4. Maggiori dettagli</h2>
      <p>
        Per i dati personali vedi la{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
