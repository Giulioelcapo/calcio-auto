import type { Metadata } from "next";
import { Barlow_Condensed, Oswald, Source_Sans_3 } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { AmazonFooterStrip } from "@/components/AmazonFooterStrip";
import { Footer, Header } from "@/components/Header";
import {
  SITE_NAME,
  SITE_TAGLINE,
  adsenseClient,
  googleSiteVerification,
  siteUrl,
} from "@/lib/site";
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
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Hub SEO di calcio aggiornato in automatico: classifiche, calendari, risultati e insight sui 12 campionati free di football-data.org.",
  openGraph: {
    title: SITE_NAME,
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
