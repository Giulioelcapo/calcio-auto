import type { Metadata } from "next";
import { Barlow_Condensed, Oswald, Source_Sans_3 } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { AmazonFooterStrip } from "@/components/AmazonFooterStrip";
import { Footer, Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/geo";
import {
  SITE_NAME,
  SITE_TAGLINE,
  adsenseClient,
  googleSiteVerification,
  siteUrl,
} from "@/lib/site";
import { SEASON_LABEL } from "@/lib/season";
import "./globals.css";

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const data = Barlow_Condensed({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const verification = googleSiteVerification();
const adsense = adsenseClient();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `Classifiche calcio e partite di oggi ${SEASON_LABEL} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Classifica Serie A, Premier League e campionati ${SEASON_LABEL}: partite di oggi, risultati, calendari e marcatori aggiornati. Hub calcio ${SITE_NAME}.`,
  keywords: [
    "partite di oggi",
    "classifica serie a",
    "classifica premier league",
    "calendario serie a",
    "risultati calcio",
    SITE_NAME,
  ],
  openGraph: {
    title: `${SITE_NAME} — classifiche e partite di oggi`,
    description: SITE_TAGLINE,
    type: "website",
    locale: "it_IT",
    url: siteUrl(),
  },
  ...(adsense
    ? {
        other: {
          "google-adsense-account": adsense,
        },
      }
    : {}),
  ...(verification
    ? { verification: { google: verification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} ${data.variable} h-full`}
    >
      <head>
        {adsense ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
          {children}
        </main>
        <AmazonFooterStrip />
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
