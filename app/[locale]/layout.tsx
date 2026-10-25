import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import {
  Cormorant_Garamond,
  Inter,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";

/* Weights mirror the approved brand board (docs/identity/brand-board.html).
   preload:false on the Latin pair: only the Arabic pair is used on /ar (the
   default locale), so preloading all four (~350KB) delays LCP on every first
   visit. display:'swap' still fetches Latin fonts when an /en page needs them. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-naskh",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const naskhSans = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-naskh-sans",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: t("Metadata.title"),
      template: `%s — ${t("Brand.name")}`,
    },
    description: t("Metadata.description"),
  };
}

/* Only ar/en render. Unknown locale params (e.g. /unknown.txt) become
   route-unmatched → app/global-not-found.tsx SSRs a full 404 document
   (documented global-not-found path; without this, [locale] matches every
   single-segment path and the root boundary cannot SSR without a root layout). */
export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  /* No locale validation here: dynamicParams=false makes unknown [locale]
     values route-unmatched before any layout runs → root not-found SSRs.
     i18n/request.ts keeps its own guard as defense in depth. */
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations();
  const fontVariables = [
    cormorant.variable,
    naskh.variable,
    inter.variable,
    naskhSans.variable,
  ].join(" ");

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={fontVariables}
    >
      <body className="bg-ivory font-body text-ink">
        <NextIntlClientProvider messages={messages}>
          <a href="#content" className="skip-link">
            {t("Skip")}
          </a>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
