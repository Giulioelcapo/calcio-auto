import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME, contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description: `Contatta il team di ${SITE_NAME}.`,
};

export default function ContattiPage() {
  const email = contactEmail();

  return (
    <LegalPage title="Contatti" updated="10 agosto 2026">
      <p>
        Hai domande su {SITE_NAME}, segnalazioni dati o richieste privacy?
        Scrivici.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${email}`}>{email}</a>
      </p>

      <h2>Sponsor / partner</h2>
      <p>
        Per banner e collaborazioni:{" "}
        <a href="mailto:info@sidepitchhub.com?subject=Sponsor%20Side%20Pitch%20Hub">
          info@sidepitchhub.com
        </a>{" "}
        oppure la pagina <a href="/partner">/partner</a>.
      </p>

      <h2>Tempi di risposta</h2>
      <p>
        Cerchiamo di rispondere entro pochi giorni lavorativi. Per richieste
        GDPR indica nell’oggetto “Privacy”.
      </p>

      <h2>Note</h2>
      <p>
        Non forniamo assistenza su scommesse o consulenza legale. I contenuti
        calcistici sono informativi e aggiornati in automatico da fonti dati
        terze.
      </p>
    </LegalPage>
  );
}
