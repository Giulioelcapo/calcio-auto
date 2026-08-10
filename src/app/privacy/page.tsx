import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME, contactEmail, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Informativa privacy di ${SITE_NAME}.`,
};

export default function PrivacyPage() {
  const email = contactEmail();
  const url = siteUrl();

  return (
    <LegalPage title="Privacy Policy" updated="10 agosto 2026">
      <p>
        Questa informativa descrive come <strong>{SITE_NAME}</strong> (
        <a href={url}>{url}</a>) tratta i dati personali degli utenti, in
        conformità al Regolamento UE 2016/679 (GDPR).
      </p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Titolare: gestore di {SITE_NAME}. Contatto:{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Dati trattati</h2>
      <ul>
        <li>Dati di navigazione tecnici (IP, log server, user-agent)</li>
        <li>Cookie e identificatori pubblicitari (se accetti i cookie)</li>
        <li>Dati che invii volontariamente via email di contatto</li>
      </ul>
      <p>
        Non chiediamo registrazione account. I dati calcistici mostrati
        provengono da fonti terze (es. football-data.org) e non sono dati
        personali degli utenti.
      </p>

      <h2>3. Finalità e basi giuridiche</h2>
      <ul>
        <li>Fornire il sito e garantire sicurezza (interesse legittimo)</li>
        <li>Misurare traffico e migliorare i contenuti (interesse legittimo / consenso cookie)</li>
        <li>Mostrare annunci personalizzati o non personalizzati tramite Google AdSense (consenso dove richiesto)</li>
        <li>Rispondere alle richieste di contatto (esecuzione di misure precontrattuali / consenso)</li>
      </ul>

      <h2>4. Google AdSense e cookie di terze parti</h2>
      <p>
        Sul sito possono essere mostrati annunci di Google AdSense. Google può
        usare cookie per pubblicare annunci in base alle visite precedenti
        dell’utente su questo o altri siti. Puoi gestire le preferenze su{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          adssettings.google.com
        </a>{" "}
        e consultare la privacy di Google.
      </p>

      <h2>5. Conservazione</h2>
      <p>
        I log tecnici sono conservati per il tempo necessario a sicurezza e
        diagnostica. I dati di contatto email sono conservati solo per gestire
        la richiesta.
      </p>

      <h2>6. Diritti dell’interessato</h2>
      <p>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione,
        opposizione e portabilità scrivendo a{" "}
        <a href={`mailto:${email}`}>{email}</a>. Hai anche diritto di reclamo
        al Garante Privacy.
      </p>

      <h2>7. Trasferimenti extra-UE</h2>
      <p>
        Alcuni fornitori (hosting, Google) possono trattare dati fuori dallo
        SEE con garanzie adeguate (es. clausole contrattuali tipo).
      </p>

      <h2>8. Aggiornamenti</h2>
      <p>
        Possiamo aggiornare questa pagina: la data in alto indica l’ultima
        revisione.
      </p>
    </LegalPage>
  );
}
