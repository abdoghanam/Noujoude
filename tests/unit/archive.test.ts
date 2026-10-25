import { describe, expect, it } from "vitest";
import { collectTags, filterArticles, paginate } from "@/lib/archive";
import type { ArticleMeta } from "@/lib/content";

function article(overrides: Partial<ArticleMeta>): ArticleMeta {
  return {
    slug: "sample",
    locale: "ar",
    title: "Title",
    description: "Description",
    date: "2026-01-01",
    category: "coins",
    tags: ["tag-a"],
    draft: false,
    ...overrides,
  };
}

const archive: ArticleMeta[] = [
  article({ slug: "a", category: "coins", tags: ["تقليب", "نادر"] }),
  article({ slug: "b", category: "art", tags: ["تقليب"] }),
  article({ slug: "c", category: "coins", tags: ["حديث"] }),
  article({ slug: "d", category: "stamps", tags: ["نادر"] }),
];

describe("filterArticles (wireframes §3 — shareable URL filters)", () => {
  it("returns everything when no filter is set", () => {
    expect(filterArticles(archive, {})).toHaveLength(4);
  });

  it("filters by category", () => {
    expect(
      filterArticles(archive, { category: "coins" }).map((a) => a.slug),
    ).toEqual(["a", "c"]);
  });

  it("filters by tag", () => {
    expect(
      filterArticles(archive, { tag: "تقليب" }).map((a) => a.slug),
    ).toEqual(["a", "b"]);
  });

  it("combines category and tag (AND)", () => {
    expect(
      filterArticles(archive, { category: "coins", tag: "تقليب" }).map(
        (a) => a.slug,
      ),
    ).toEqual(["a"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterArticles(archive, { category: "art", tag: "نادر" })).toEqual(
      [],
    );
  });
});

describe("paginate (wireframes §3 — load more / numbered pages)", () => {
  const items = Array.from({ length: 30 }, (_, i) => i + 1);

  it("splits into pages of the given size", () => {
    const page1 = paginate(items, undefined, 12);
    expect(page1.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(page1.totalPages).toBe(3);
    expect(page1.hasPrev).toBe(false);
    expect(page1.hasNext).toBe(true);
  });

  it("returns the requested page with prev/next flags", () => {
    const page2 = paginate(items, "2", 12);
    expect(page2.items[0]).toBe(13);
    expect(page2.hasPrev).toBe(true);
    expect(page2.hasNext).toBe(true);
  });

  it("clamps out-of-range pages into the valid range", () => {
    expect(paginate(items, "99", 12).page).toBe(3);
    expect(paginate(items, "0", 12).page).toBe(1);
    expect(paginate(items, "-5", 12).page).toBe(1);
    expect(paginate(items, "not-a-number", 12).page).toBe(1);
    expect(paginate(items, 2.7, 12).page).toBe(2);
  });

  it("yields one empty page for an empty list", () => {
    const empty = paginate([], "3", 12);
    expect(empty.items).toEqual([]);
    expect(empty.totalPages).toBe(1);
    expect(empty.hasPrev).toBe(false);
    expect(empty.hasNext).toBe(false);
  });
});

describe("collectTags (archive tag filter source)", () => {
  it("deduplicates tags in first-seen order", () => {
    expect(collectTags(archive)).toEqual(["تقليب", "نادر", "حديث"]);
  });

  it("returns an empty list for an empty archive", () => {
    expect(collectTags([])).toEqual([]);
  });
});
