import type { ArticleMeta, ArticleCategory } from "./content";

/* Wireframes §3: filters are shareable (URL-backed) and results are counted.
   Pure functions — unit-tested in tests/unit/archive.test.ts. */

export const ARCHIVE_PAGE_SIZE = 12;

export interface ArchiveFilter {
  /** Valid category slug only — invalid/absent means "no category filter". */
  category?: ArticleCategory;
  /** Free-text tag exactly as stored in frontmatter. */
  tag?: string;
}

export function filterArticles(
  articles: ArticleMeta[],
  filter: ArchiveFilter,
): ArticleMeta[] {
  return articles.filter((article) => {
    if (filter.category && article.category !== filter.category) {
      return false;
    }
    if (filter.tag && !article.tags.includes(filter.tag)) {
      return false;
    }
    return true;
  });
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/* Out-of-range pages clamp to the valid range (page=0 or non-numeric → 1,
   page beyond the end → last page); an empty list yields one empty page. */
export function paginate<T>(
  items: T[],
  rawPage: number | string | undefined,
  pageSize: number = ARCHIVE_PAGE_SIZE,
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = typeof rawPage === "number" ? rawPage : Number(rawPage);
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), totalPages)
    : 1;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/** Unique tags across the archive, deduplicated, in first-seen order. */
export function collectTags(articles: ArticleMeta[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const article of articles) {
    for (const tag of article.tags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        tags.push(tag);
      }
    }
  }
  return tags;
}
