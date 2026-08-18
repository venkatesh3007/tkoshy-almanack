import type { Metadata } from "next";
import Link from "next/link";
import {
  Libre_Caslon_Display,
  Spectral,
  IBM_Plex_Mono,
} from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const disp = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-disp",
  display: "swap",
});
const serif = Spectral({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.author}'s Blog`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.author, url: SITE.url }],
  creator: SITE.author,
  publisher: SITE.author,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${SITE.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.author}'s Blog`,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.author}'s Blog`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${disp.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <div className="wrap">
          {children}
          <footer className="sitefoot">
            <div>
              {SITE.name} · essays by {SITE.author} since December 2008 ·
              serials run chronologically from 001
            </div>
            <div>
              <Link href="/">Register</Link> · <Link href="/topics">Topics</Link>{" "}
              · <a href="/feed.xml">RSS</a> ·{" "}
              <a
                href="https://rollingstone-revelations.blogspot.com"
                target="_blank"
                rel="noopener"
              >
                Original blog
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
