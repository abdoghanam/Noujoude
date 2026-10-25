import type { MetadataRoute } from "next";
import { ARTICLE_LOCALES, getPublishedArticles } from "@/lib/content";
import { absoluteUrl, alternateLanguages } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/articles",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of ARTICLE_LOCALES) {
      entries.push({
        url: absoluteUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: alternateLanguages(path),
        },
      });
    }
  }

  for (const locale of ARTICLE_LOCALES) {
    for (const article of getPublishedArticles(locale)) {
      const path = `/articles/${article.slug}`;
      entries.push({
        url: absoluteUrl(locale, path),
        lastModified: new Date(article.date),
        changeFrequency: "yearly",
        priority: 0.6,
        alternates: {
          languages: alternateLanguages(path),
        },
      });
    }
  }

  return entries;
}
