# CalcioAuto

Blog/web app calcio automatico, SEO-first, pronto per Google AdSense.

## Avvio locale

```bash
cd C:\Users\giuli\calcio-auto
cp .env.example .env.local
npm install
npm run dev
```

Apri http://localhost:3000

## Checklist per guadagnare (ordine)

### 1) Token dati reali
1. Registrati su https://www.football-data.org/client/register
2. Metti il token in `.env.local` → `FOOTBALL_DATA_API_TOKEN=`

### 2) Email e sito
In `.env.local`:
```env
NEXT_PUBLIC_CONTACT_EMAIL=tua-email@dominio.it
NEXT_PUBLIC_SITE_URL=https://tuodominio.it
```

### 3) Deploy su Vercel (gratis)
1. Crea account su https://vercel.com
2. Push del progetto su GitHub (o importa la cartella)
3. New Project → seleziona il repo → Deploy
4. In Vercel → Settings → Environment Variables aggiungi le stesse di `.env.local`
5. Collega un dominio (Domains)

### 4) Google Search Console
1. https://search.google.com/search-console
2. Aggiungi proprietà URL del dominio
3. Invia sitemap: `https://tuodominio.it/sitemap.xml`

### 5) Google AdSense
1. https://www.google.com/adsense/ — richiedi il sito
2. Attendi approvazione (giorni/settimane)
3. Crea 3 unità annuncio Display responsive (Top / Side / In-content)
4. In Vercel env:
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_TOP=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_SIDE=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT=1234567890
```
5. Redeploy

Il sito carica AdSense **solo dopo** “Accetta” nel banner cookie.

## Pagine legali già pronte
- `/chi-siamo`
- `/contatti`
- `/privacy`
- `/cookie`

## Campionati free
Premier League, Championship, Bundesliga, Serie A, La Liga, Ligue 1, Eredivisie, Primeira Liga, Brasileirão, Champions League, Mondiali, Europeo.

## Note AdSense
Google può rifiutare siti troppo “automatici”. Tieni aggiornati i dati reali, testi descrittivi e pagine legali. Non mettere troppi ads su pagine vuote pre-stagione.
