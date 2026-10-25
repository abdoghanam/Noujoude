import type { ReactElement, ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ArticleCard from "@/components/content/ArticleCard";
import type { ArticleMeta } from "@/lib/content";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const article: ArticleMeta = {
  slug: "sample",
  locale: "ar",
  title: "Sample title",
  description: "Sample description",
  date: "2026-10-17",
  category: "stamps",
  tags: ["test"],
  draft: false,
};

async function renderHtml(node: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(node);
  return new Response(stream).text();
}

describe("ArticleCard heading level (Lighthouse heading-order)", () => {
  it("defaults to h3 (home page: under an h2 section)", async () => {
    const html = await renderHtml(
      <ArticleCard article={article} categoryLabel="Stamps" />,
    );
    expect(html).toContain("<h3");
    expect(html).not.toContain("<h2");
  });

  it("renders h2 when level=2 (archive: directly under the page h1)", async () => {
    const html = await renderHtml(
      <ArticleCard article={article} categoryLabel="Stamps" level={2} />,
    );
    expect(html).toContain("<h2");
    expect(html).not.toContain("<h3");
  });
});
