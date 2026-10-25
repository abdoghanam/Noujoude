import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const ARTICLE_CATEGORIES = [
  "stamps",
  "coins",
  "art",
  "antiques",
  "memorabilia",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_LOCALES = ["ar", "en"] as const;

export type ArticleLocale = (typeof ARTICLE_LOCALES)[number];

export interface ArticleMeta {
  slug: string;
  locale: ArticleLocale;
  title: string;
  description: string;
  date: string;
  category: ArticleCategory;
  tags: string[];
  draft: boolean;
  cover?: string;
}

export interface Article extends ArticleMeta {
  source: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isArticleLocale(value: string): value is ArticleLocale {
  return (ARTICLE_LOCALES as readonly string[]).includes(value);
}

export function isArticleCategory(value: string): value is ArticleCategory {
  return (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}

function fail(filePath: string, message: string): never {
  const rel = path.relative(process.cwd(), filePath);
  throw new Error(`[content] ${rel}: ${message}`);
}

function articlesDir(
  locale: ArticleLocale,
  root: string = CONTENT_ROOT,
): string {
  return path.join(root, locale, "articles");
}

function loadArticle(locale: ArticleLocale, filePath: string): Article {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = path.basename(filePath, ".mdx");
  if (!SLUG_PATTERN.test(slug)) {
    fail(
      filePath,
      `invalid slug "${slug}" — expected lowercase kebab-case (e.g. "my-article")`,
    );
  }

  if (typeof data.title !== "string" || data.title.trim() === "") {
    fail(filePath, 'missing or empty required frontmatter field "title"');
  }
  if (typeof data.description !== "string" || data.description.trim() === "") {
    fail(filePath, 'missing or empty required frontmatter field "description"');
  }
  if (typeof data.date !== "string" || !DATE_PATTERN.test(data.date)) {
    fail(
      filePath,
      'frontmatter field "date" must be a string in YYYY-MM-DD format',
    );
  }
  const parsedDate = new Date(`${data.date}T00:00:00Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== data.date
  ) {
    fail(
      filePath,
      `frontmatter field "date" is not a real calendar date: ${data.date}`,
    );
  }
  if (typeof data.category !== "string" || !isArticleCategory(data.category)) {
    fail(
      filePath,
      `frontmatter field "category" must be one of: ${ARTICLE_CATEGORIES.join(", ")}`,
    );
  }
  /* requirements §4: tags required, minimum one entry */
  if (!Array.isArray(data.tags)) {
    fail(
      filePath,
      'missing required frontmatter field "tags" (array with at least one string)',
    );
  }
  if (
    data.tags.length === 0 ||
    data.tags.some(
      (tag: unknown) => typeof tag !== "string" || tag.trim() === "",
    )
  ) {
    fail(
      filePath,
      'frontmatter field "tags" must contain at least one non-empty string',
    );
  }
  const tags = (data.tags as string[]).map((tag) => tag.trim());
  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    fail(filePath, 'frontmatter field "draft" must be a boolean when present');
  }
  /* requirements §4: cover optional — path inside public/ (no assets yet) */
  if (
    data.cover !== undefined &&
    (typeof data.cover !== "string" || data.cover.trim() === "")
  ) {
    fail(
      filePath,
      'frontmatter field "cover" must be a non-empty string when present',
    );
  }

  return {
    slug,
    locale,
    title: data.title.trim(),
    description: data.description.trim(),
    date: data.date,
    category: data.category,
    tags,
    draft: data.draft ?? false,
    ...(typeof data.cover === "string" ? { cover: data.cover.trim() } : {}),
    source: content,
  };
}

function readArticles(
  locale: ArticleLocale,
  root: string = CONTENT_ROOT,
): Article[] {
  const dir = articlesDir(locale, root);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => loadArticle(locale, path.join(dir, name)));
}

export function getPublishedArticles(
  locale: ArticleLocale,
  root: string = CONTENT_ROOT,
): ArticleMeta[] {
  return readArticles(locale, root)
    .filter((article) => !article.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getRelatedArticles(article: ArticleMeta): ArticleMeta[] {
  return getPublishedArticles(article.locale)
    .filter(
      (candidate) =>
        candidate.slug !== article.slug &&
        candidate.category === article.category,
    )
    .slice(0, 3);
}

export function getArticle(
  locale: ArticleLocale,
  slug: string,
  root: string = CONTENT_ROOT,
): Article | null {
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }
  const filePath = path.join(articlesDir(locale, root), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return loadArticle(locale, filePath);
}

export function assertArticleParity(root: string = CONTENT_ROOT): void {
  const slugsByLocale = new Map<ArticleLocale, Set<string>>(
    ARTICLE_LOCALES.map((locale) => [
      locale,
      new Set(
        getPublishedArticles(locale, root).map((article) => article.slug),
      ),
    ]),
  );
  const [arSlugs, enSlugs] = ARTICLE_LOCALES.map((locale) =>
    slugsByLocale.get(locale)!,
  );

  const missingInEn = [...arSlugs].filter((slug) => !enSlugs.has(slug)).sort();
  const missingInAr = [...enSlugs].filter((slug) => !arSlugs.has(slug)).sort();

  if (missingInEn.length === 0 && missingInAr.length === 0) {
    return;
  }

  const lines: string[] = [];
  for (const slug of missingInEn) {
    lines.push(
      `  content/ar/articles/${slug}.mdx exists — missing counterpart content/en/articles/${slug}.mdx`,
    );
  }
  for (const slug of missingInAr) {
    lines.push(
      `  content/en/articles/${slug}.mdx exists — missing counterpart content/ar/articles/${slug}.mdx`,
    );
  }
  throw new Error(
    [
      "[Q2-A] Article language parity violated — publishing requires every",
      "published slug to exist in both ar and en. Build blocked:",
      ...lines,
    ].join("\n"),
  );
}
