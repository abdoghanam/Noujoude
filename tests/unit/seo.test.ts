import { afterEach, describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { getPublishedArticles } from "@/lib/content";
import {
  absoluteUrl,
  alternateLanguages,
  pageMetadata,
  siteUrl,
} from "@/lib/seo";

const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalEnv === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  }
});

describe("site URL base (D2 plug point)", () => {
  it("defaults to localhost when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("uses NEXT_PUBLIC_SITE_URL without trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.org///";
    expect(siteUrl()).toBe("https://example.org");
    expect(absoluteUrl("ar", "/about")).toBe("https://example.org/ar/about");
  });
});

describe("hreflang alternates (requirements §153)", () => {
  it("exposes ar, en and x-default pointing at the default locale", () => {
    expect(alternateLanguages("/about")).toEqual({
      ar: "http://localhost:3000/ar/about",
      en: "http://localhost:3000/en/about",
      "x-default": "http://localhost:3000/ar/about",
    });
  });
});

describe("pageMetadata canonical (requirements §152)", () => {
  it("sets the canonical to the page's own language URL", () => {
    const metadata = pageMetadata({ locale: "en", path: "/about" });
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/en/about",
    );
  });
});

describe("Open Graph + Twitter Card (requirements §156)", () => {
  it("emits og and twitter fields with the page title and description", () => {
    const metadata = pageMetadata({
      locale: "ar",
      path: "/articles",
      title: "المقالات",
      description: "وصف الصفحة",
    });
    expect(metadata.title).toBe("المقالات");
    expect(metadata.description).toBe("وصف الصفحة");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      siteName: "NOUJOUDE — نجود",
      url: "http://localhost:3000/ar/articles",
      title: "المقالات",
      description: "وصف الصفحة",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary",
      title: "المقالات",
      description: "وصف الصفحة",
    });
  });

  it("maps locales to og:locale and lists the alternate", () => {
    const ar = pageMetadata({ locale: "ar", path: "" });
    expect(ar.openGraph).toMatchObject({
      locale: "ar_AR",
      alternateLocale: ["en_US"],
    });
    const en = pageMetadata({ locale: "en", path: "" });
    expect(en.openGraph).toMatchObject({
      locale: "en_US",
      alternateLocale: ["ar_AR"],
    });
  });

  it("supports article type with flat publishedTime (Next 16 og shape)", () => {
    const metadata = pageMetadata({
      locale: "en",
      path: "/articles/x",
      title: "Title",
      description: "Description",
      type: "article",
      publishedTime: "2026-10-15",
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-15",
    });
  });

  it("keeps <title> template-inherited when only ogTitle is supplied (home)", () => {
    const metadata = pageMetadata({
      locale: "ar",
      path: "",
      ogTitle: "نجود — NOUJOUDE",
      description: "وصف",
    });
    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({ title: "نجود — NOUJOUDE" });
    expect(metadata.twitter).toMatchObject({ title: "نجود — NOUJOUDE" });
  });

  it("emits og:image and twitter:image on every page (256×256 summary card)", () => {
    const metadata = pageMetadata({
      locale: "ar",
      path: "/articles",
      title: "المقالات",
      description: "وصف",
    });
    expect(metadata.openGraph?.images).toEqual([
      { url: "http://localhost:3000/icon.png", width: 256, height: 256 },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "http://localhost:3000/icon.png",
    ]);
  });
});

describe("sitemap generation (requirements §154 + architecture §4)", () => {
  const entries = sitemap();

  it("covers both locales for every static page", () => {
    const urls = entries.map((entry) => entry.url);
    for (const locale of ["ar", "en"]) {
      for (const path of [
        "",
        "/articles",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
      ]) {
        expect(urls).toContain(`http://localhost:3000/${locale}${path}`);
      }
    }
  });

  it("includes every published article in both locales, from the content index", () => {
    const slugs = getPublishedArticles("ar").map((article) => article.slug);
    const urls = entries.map((entry) => entry.url);
    for (const slug of slugs) {
      expect(urls).toContain(`http://localhost:3000/ar/articles/${slug}`);
      expect(urls).toContain(`http://localhost:3000/en/articles/${slug}`);
    }
  });

  it("emits xhtml alternates (ar/en/x-default) on every entry", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(languages.ar).toContain("/ar");
      expect(languages.en).toContain("/en");
      expect(languages["x-default"]).toContain("/ar");
    }
  });

  it("has 12 static entries plus two per published article", () => {
    const articleCount = getPublishedArticles("ar").length;
    expect(entries).toHaveLength(12 + articleCount * 2);
  });
});
