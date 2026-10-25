import { expect, test, type Page } from "@playwright/test";

const SEEDS = [
  "/ar",
  "/en",
  "/ar/articles",
  "/en/articles",
  "/ar/articles/test-mdx-pipeline",
  "/en/articles/test-mdx-pipeline",
  "/ar/about",
  "/en/about",
  "/ar/contact",
  "/en/contact",
  "/ar/privacy",
  "/en/privacy",
  "/ar/terms",
  "/en/terms",
];

async function collectInternalLinks(
  page: Page,
  path: string,
): Promise<string[]> {
  await page.goto(path);
  return page.$$eval("a[href]", (anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
  );
}

test.describe("internal link check (requirements §222 — zero broken links)", () => {
  test("every internal link on every page resolves (< 400)", async ({
    page,
    request,
  }) => {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      for (const href of await collectInternalLinks(page, seed)) {
        const url = new URL(href);
        if (url.origin !== "http://127.0.0.1:3000") continue;
        url.hash = "";
        seen.add(url.pathname + url.search);
      }
    }

    expect(seen.size).toBeGreaterThan(10);
    const broken: string[] = [];
    for (const path of [...seen].sort()) {
      const response = await request.get(path);
      if (response.status() >= 400) {
        broken.push(`${response.status()} ${path}`);
      }
    }
    expect(broken).toEqual([]);
  });

  test("sitemap URLs all respond 200", async ({ page, request }) => {
    await page.goto("/sitemap.xml");
    const xml = await page.content();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(locs.length).toBeGreaterThanOrEqual(14);
    const broken: string[] = [];
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const response = await request.get(path);
      if (response.status() !== 200) {
        broken.push(`${response.status()} ${path}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
