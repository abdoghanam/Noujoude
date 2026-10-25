import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  assertArticleParity,
  getArticle,
  getPublishedArticles,
} from "@/lib/content";

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "nuojed-content-"));
  for (const locale of ["ar", "en"]) {
    fs.mkdirSync(path.join(root, locale, "articles"), { recursive: true });
  }
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function writeFixture(locale: string, fileName: string, body: string) {
  fs.writeFileSync(path.join(root, locale, "articles", fileName), body);
}

const validAr = [
  "---",
  'title: "عنوان"',
  'description: "وصف"',
  'date: "2026-01-02"',
  'category: "coins"',
  'tags: ["وسم"]',
  "draft: false",
  "---",
  "",
  "نص المقال.",
].join("\n");

const validEn = [
  "---",
  'title: "Title"',
  'description: "Description"',
  'date: "2026-01-02"',
  'category: "coins"',
  'tags: ["demo"]',
  "---",
  "",
  "Article body.",
].join("\n");

describe("content frontmatter validation (architecture §5)", () => {
  it("parses a valid article", () => {
    writeFixture("ar", "valid-article.mdx", validAr);
    const article = getArticle("ar", "valid-article", root);
    expect(article).not.toBeNull();
    expect(article?.title).toBe("عنوان");
    expect(article?.date).toBe("2026-01-02");
    expect(article?.category).toBe("coins");
    expect(article?.tags).toEqual(["وسم"]);
    expect(article?.draft).toBe(false);
  });

  it("fails on missing title", () => {
    writeFixture("ar", "no-title.mdx", validAr.replace('title: "عنوان"\n', ""));
    expect(() => getArticle("ar", "no-title", root)).toThrow(/"title"/);
  });

  it("fails on impossible calendar date", () => {
    writeFixture(
      "ar",
      "bad-date.mdx",
      validAr.replace('date: "2026-01-02"', 'date: "2026-02-31"'),
    );
    expect(() => getArticle("ar", "bad-date", root)).toThrow(
      /real calendar date/,
    );
  });

  it("fails on category outside the approved five", () => {
    writeFixture(
      "ar",
      "bad-cat.mdx",
      validAr.replace('category: "coins"', 'category: "cars"'),
    );
    expect(() => getArticle("ar", "bad-cat", root)).toThrow(/"category"/);
  });

  it("fails when the required tags field is missing (requirements §4)", () => {
    writeFixture("ar", "no-tags.mdx", validAr.replace('tags: ["وسم"]\n', ""));
    expect(() => getArticle("ar", "no-tags", root)).toThrow(/"tags"/);
  });

  it("fails when tags is an empty array (minimum one tag)", () => {
    writeFixture(
      "ar",
      "empty-tags.mdx",
      validAr.replace('tags: ["وسم"]', "tags: []"),
    );
    expect(() => getArticle("ar", "empty-tags", root)).toThrow(
      /at least one non-empty string/,
    );
  });

  it("fails when a tag entry is blank", () => {
    writeFixture(
      "ar",
      "blank-tag.mdx",
      validAr.replace('tags: ["وسم"]', 'tags: ["  "]'),
    );
    expect(() => getArticle("ar", "blank-tag", root)).toThrow(
      /at least one non-empty string/,
    );
  });

  it("accepts an optional cover path and rejects a non-string cover", () => {
    writeFixture(
      "ar",
      "with-cover.mdx",
      validAr.replace(
        'tags: ["وسم"]',
        'tags: ["وسم"]\ncover: "/covers/piece.jpg"',
      ),
    );
    expect(getArticle("ar", "with-cover", root)?.cover).toBe(
      "/covers/piece.jpg",
    );
    writeFixture(
      "ar",
      "bad-cover.mdx",
      validAr.replace('tags: ["وسم"]', 'tags: ["وسم"]\ncover: 42'),
    );
    expect(() => getArticle("ar", "bad-cover", root)).toThrow(/"cover"/);
  });

  it("fails on uppercase slug filename", () => {
    writeFixture("ar", "Bad_Slug.mdx", validAr);
    expect(() => getPublishedArticles("ar", root)).toThrow(/kebab-case/);
  });

  it("excludes drafts from the published index but keeps them readable", () => {
    writeFixture(
      "ar",
      "drafted.mdx",
      validAr.replace("draft: false", "draft: true"),
    );
    expect(getPublishedArticles("ar", root)).toHaveLength(0);
    expect(getArticle("ar", "drafted", root)?.draft).toBe(true);
  });

  it("sorts published articles by date descending", () => {
    writeFixture(
      "ar",
      "older.mdx",
      validAr.replace("2026-01-02", "2025-06-01"),
    );
    writeFixture(
      "ar",
      "newer.mdx",
      validAr.replace("2026-01-02", "2026-03-04"),
    );
    const slugs = getPublishedArticles("ar", root).map((a) => a.slug);
    expect(slugs).toEqual(["newer", "older"]);
  });
});

describe("Q2-A language parity (publish gate)", () => {
  it("passes when both locales carry the same published slug", () => {
    writeFixture("ar", "paired.mdx", validAr);
    writeFixture("en", "paired.mdx", validEn);
    expect(() => assertArticleParity(root)).not.toThrow();
  });

  it("fails an ar-only article, naming the missing en counterpart", () => {
    writeFixture("ar", "lonely.mdx", validAr);
    expect(() => assertArticleParity(root)).toThrow(
      /content\/ar\/articles\/lonely\.mdx/,
    );
    expect(() => assertArticleParity(root)).toThrow(
      /missing counterpart content\/en\/articles\/lonely\.mdx/,
    );
  });

  it("fails an en-only article, naming the missing ar counterpart", () => {
    writeFixture("en", "lonely-en.mdx", validEn);
    expect(() => assertArticleParity(root)).toThrow(
      /missing counterpart content\/ar\/articles\/lonely-en\.mdx/,
    );
  });

  it("ignores drafts when checking parity", () => {
    writeFixture(
      "ar",
      "wip.mdx",
      validAr.replace("draft: false", "draft: true"),
    );
    expect(() => assertArticleParity(root)).not.toThrow();
  });
});
