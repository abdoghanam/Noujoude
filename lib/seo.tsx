import type { Metadata } from "next";

export function siteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

export function absoluteUrl(locale: string, path = ""): string {
  const normalized = path === "" || path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}/${locale}${normalized}`;
}

export function absolutePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

export function alternateLanguages(path: string): Record<string, string> {
  return {
    ar: absoluteUrl("ar", path),
    en: absoluteUrl("en", path),
    "x-default": absoluteUrl("ar", path),
  };
}

/* Approved brand name (D1-B) — identical in ar/en messages (Brand.name). */
export const SITE_NAME = "NOUJOUDE — نجود";

/* Open Graph share image — app/icon.png (256×256, summary card).
   Absolute URL required so crawlers on any origin can fetch it. */
export function ogImageUrl(): string {
  return absolutePath("/icon.png");
}

const OG_LOCALE: Record<string, string> = {
  ar: "ar_AR",
  en: "en_US",
};

export function pageMetadata({
  locale,
  path,
  title,
  ogTitle,
  description,
  type = "website",
  publishedTime,
}: {
  locale: string;
  path: string;
  /** Page title — applied to <title> (with the layout template) and to og/twitter. */
  title?: string;
  /** Overrides the og/twitter title when <title> must stay template-inherited (home). */
  ogTitle?: string;
  description?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const canonical = absoluteUrl(locale, path);
  const socialTitle = ogTitle ?? title;
  const alternateLocales = Object.entries(OG_LOCALE)
    .filter(([code]) => code !== locale)
    .map(([, value]) => value);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: alternateLanguages(path),
    },
    /* requirements §6: Open Graph + Twitter Card on every page.
       Next 16 shape (opengraph-types.d.ts): article fields are FLAT on
       openGraph — { type: "article", publishedTime } — not nested. */
    openGraph: {
      type,
      ...(OG_LOCALE[locale] ? { locale: OG_LOCALE[locale] } : {}),
      ...(alternateLocales.length > 0
        ? { alternateLocale: alternateLocales }
        : {}),
      siteName: SITE_NAME,
      url: canonical,
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      images: [{ url: ogImageUrl(), width: 256, height: 256 }],
    },
    twitter: {
      card: "summary",
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      images: [ogImageUrl()],
    },
  };
}

type JsonLd = Record<string, unknown>;

export function websiteJsonLd({
  locale,
  name,
  description,
}: {
  locale: string;
  name: string;
  description: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: absoluteUrl(locale),
    inLanguage: locale,
  };
}

export function breadcrumbJsonLd({
  locale,
  items,
}: {
  locale: string;
  items: { name: string; path: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

export function articleJsonLd({
  locale,
  article,
}: {
  locale: string;
  article: {
    title: string;
    description: string;
    date: string;
    slug: string;
  };
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    inLanguage: locale,
    url: absoluteUrl(locale, `/articles/${article.slug}`),
  };
}

export function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
