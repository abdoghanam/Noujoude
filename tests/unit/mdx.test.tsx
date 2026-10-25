import type { ReactElement, ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { renderMdx } from "@/lib/mdx";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

async function renderHtml(node: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(node);
  return new Response(stream).text();
}

describe("MDX pipeline compilation (T2)", () => {
  it("compiles markdown structure to HTML", async () => {
    const html = await renderHtml(
      (await renderMdx(
        "Hello **bold** and *italic*.\n\n- one\n- two",
      )) as ReactElement,
    );
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<ul>");
  });

  it("maps internal links through the locale-aware Link", async () => {
    const html = await renderHtml(
      (await renderMdx("[articles](/articles)")) as ReactElement,
    );
    expect(html).toContain('href="/articles"');
  });

  it("maps external links to plain anchors with rel", async () => {
    const html = await renderHtml(
      (await renderMdx("[site](https://example.org/page)")) as ReactElement,
    );
    expect(html).toContain('href="https://example.org/page"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
