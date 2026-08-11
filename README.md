# Side Pitch Hub

Blog/web app calcio automatico, SEO-first, pronto per Google AdSense.

**Live:** https://calcio-auto.vercel.app

## Avvio locale

```bash
cd C:\Users\giuli\calcio-auto
cp .env.example .env.local
npm install
npm run dev
```

Apri http://localhost:3000

## Checklist go-live (ordine)

### 1) Token dati reali
Già attivo su Vercel: `FOOTBALL_DATA_API_TOKEN`.

### 2) URL + email su Vercel
In **Settings → Environment Variables** (Production), aggiungi/aggiorna:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://calcio-auto.vercel.app` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | la tua email reale |

Poi **Redeploy** (senza build cache se hai dubbi).

### 3) Google Search Console
1. https://search.google.com/search-console
2. **Aggiungi proprietà** → prefisso URL → `https://calcio-auto.vercel.app`
3. Verifica (meta tag HTML):
   - copia il codice `content="...."`
   - su Vercel aggiungi `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=quelcodice`
   - Redeploy → Completa verifica in Search Console
4. **Sitemaps** → invia: `https://calcio-auto.vercel.app/sitemap.xml`

### 4) Google AdSense
1. https://www.google.com/adsense/ — richiedi il sito `https://calcio-auto.vercel.app`
2. Attendi approvazione (giorni/settimane)
3. Crea 3 unità Display responsive (Top / Side / In-content)
4. Su Vercel:
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_TOP=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_SIDE=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT=1234567890
```
5. Redeploy — `ads.txt` si aggiorna da solo su `/ads.txt`

Il sito carica gli annunci **solo dopo** “Accetta” nel banner cookie.

## Pagine legali
- `/chi-siamo` `/contatti` `/privacy` `/cookie`

## Campionati free
Premier League, Championship, Bundesliga, Serie A, La Liga, Ligue 1, Eredivisie, Primeira Liga, Brasileirão, Champions League, Mondiali, Europeo.

## Note AdSense
Google può rifiutare siti troppo “automatici”. Tieni dati reali, testi descrittivi e pagine legali. Non mettere troppi ads su pagine vuote pre-stagione.
