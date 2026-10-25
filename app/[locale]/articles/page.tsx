import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArticleCard from "@/components/content/ArticleCard";
import {
  getPublishedArticles,
  isArticleCategory,
  isArticleLocale,
} from "@/lib/content";
import {
  ARCHIVE_PAGE_SIZE,
  collectTags,
  filterArticles,
  paginate,
} from "@/lib/archive";
import { pageMetadata } from "@/lib/seo";

const categories = [
  "stamps",
  "coins",
  "art",
  "antiques",
  "memorabilia",
] as const;

type SearchParams = {
  category?: string;
  tag?: string;
  page?: string;
};

function archiveHref(query: {
  category?: string;
  tag?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.tag) params.set("tag", query.tag);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

function chipClass(active: boolean): string {
  return [
    "btn !py-1.5 !text-base no-underline border-2",
    active ? "border-ink bg-ink text-ivory" : "border-ink text-ink",
  ].join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata({
    locale,
    path: "/articles",
    title: t("Articles.title"),
    description: t("Articles.description"),
  });
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const all = isArticleLocale(locale) ? getPublishedArticles(locale) : [];
  const category =
    typeof sp.category === "string" && isArticleCategory(sp.category)
      ? sp.category
      : undefined;
  const tag =
    typeof sp.tag === "string" && sp.tag.trim() !== ""
      ? sp.tag.trim()
      : undefined;

  const filtered = filterArticles(all, { category, tag });
  const paged = paginate(filtered, sp.page, ARCHIVE_PAGE_SIZE);
  const tags = collectTags(all);
  const hasFilter = category !== undefined || tag !== undefined;
  const chipFilters = { category, tag };

  return (
    <main id="content" className="container-page py-12">
      <h1 className="text-h1">{t("Articles.title")}</h1>

      {all.length > 0 && (
        <nav aria-label={t("Articles.filtersLabel")} className="mt-6 space-y-4">
          <ul
            aria-label={t("Home.categoriesTitle")}
            className="flex flex-wrap gap-3"
          >
            <li key="all">
              <Link
                href={archiveHref({ tag })}
                className={chipClass(category === undefined)}
                aria-current={category === undefined ? "true" : undefined}
              >
                {t("Articles.allCategories")}
              </Link>
            </li>
            {categories.map((slug) => (
              <li key={slug}>
                <Link
                  href={archiveHref({ category: slug, tag })}
                  className={chipClass(category === slug)}
                  aria-current={category === slug ? "true" : undefined}
                >
                  {t(`Categories.${slug}`)}
                </Link>
              </li>
            ))}
          </ul>
          {tags.length > 0 && (
            <ul
              aria-label={t("Articles.tagsTitle")}
              className="flex flex-wrap gap-3"
            >
              {tags.map((value) => (
                <li key={value}>
                  <Link
                    href={archiveHref({ category, tag: value })}
                    className={chipClass(tag === value)}
                    aria-current={tag === value ? "true" : undefined}
                  >
                    {value}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <p aria-live="polite" className="text-ink/80">
          {t("Articles.resultsCount", { count: filtered.length })}
        </p>
        {hasFilter && (
          <Link href="/articles" className="text-green underline">
            {t("Articles.clearFilters")}
          </Link>
        )}
      </div>

      {all.length === 0 ? (
        <section className="mt-6 rounded-sm border border-sage/40 bg-white/50 p-8">
          <p className="text-lg">{t("Articles.empty")}</p>
          <p className="mt-2 text-ink/70">{t("Articles.emptyHint")}</p>
          <p className="mt-6">
            <Link href="/about" className="text-green underline">
              {t("Nav.about")}
            </Link>
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section className="mt-6 rounded-sm border border-sage/40 bg-white/50 p-8">
          <p className="text-lg">{t("Articles.emptyFiltered")}</p>
          <p className="mt-6">
            <Link href="/articles" className="text-green underline">
              {t("Articles.clearFilters")}
            </Link>
          </p>
        </section>
      ) : (
        <>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {paged.items.map((article) => (
              <li key={article.slug}>
                <ArticleCard
                  article={article}
                  categoryLabel={t(`Categories.${article.category}`)}
                  level={2}
                />
              </li>
            ))}
          </ul>

          {paged.totalPages > 1 && (
            <>
              <nav
                aria-label={t("Articles.paginationLabel")}
                className="mt-10 hidden items-center justify-center gap-2 md:flex"
              >
                {paged.hasPrev && (
                  <Link
                    href={archiveHref({
                      ...chipFilters,
                      page: paged.page - 1,
                    })}
                    className="btn btn-secondary !py-1 !text-sm no-underline"
                  >
                    {t("Articles.prev")}
                  </Link>
                )}
                <ul className="flex items-center gap-2">
                  {Array.from(
                    { length: paged.totalPages },
                    (_, index) => index + 1,
                  ).map((number) =>
                    number === paged.page ? (
                      <li key={number}>
                        <span
                          aria-current="page"
                          className="btn border-2 border-ink bg-ink !py-1 !text-sm text-ivory"
                        >
                          {number}
                        </span>
                      </li>
                    ) : (
                      <li key={number}>
                        <Link
                          href={archiveHref({ ...chipFilters, page: number })}
                          className="btn btn-secondary !py-1 !text-sm no-underline"
                        >
                          {number}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
                {paged.hasNext && (
                  <Link
                    href={archiveHref({
                      ...chipFilters,
                      page: paged.page + 1,
                    })}
                    className="btn btn-secondary !py-1 !text-sm no-underline"
                  >
                    {t("Articles.next")}
                  </Link>
                )}
              </nav>
              {paged.hasNext && (
                <p className="mt-8 md:hidden">
                  <Link
                    href={archiveHref({ ...chipFilters, page: paged.page + 1 })}
                    className="btn btn-primary block w-full text-center no-underline"
                  >
                    {t("Articles.loadMore")}
                  </Link>
                </p>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
