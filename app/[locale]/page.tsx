import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArticleCard from "@/components/content/ArticleCard";
import { getPublishedArticles, isArticleLocale } from "@/lib/content";
import { JsonLdScript, pageMetadata, websiteJsonLd } from "@/lib/seo";

const categories = [
  "stamps",
  "coins",
  "art",
  "antiques",
  "memorabilia",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  /* <title> stays the layout default/template; og/twitter get the site title. */
  return pageMetadata({
    locale,
    path: "",
    ogTitle: t("Metadata.title"),
    description: t("Home.description"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = isArticleLocale(locale) ? getPublishedArticles(locale) : [];

  return (
    <main id="content">
      {/* Hero (wireframes §2) — brand copy exact from docs/identity/brand-board.html */}
      <section className="container-page py-16 md:py-24">
        <h1 className="text-display text-ink">{t("Brand.name")}</h1>
        <p className="mt-4 font-display text-2xl text-green md:text-3xl">
          {t("Brand.tagline")}
        </p>
        <hr className="rule-gold" />
        <p className="prose-body text-lg">{t("Home.manifesto")}</p>
        <p className="mt-6">
          <Link href="/articles" className="btn btn-primary">
            {t("Home.heroCta")}
          </Link>
        </p>
        <JsonLdScript
          data={websiteJsonLd({
            locale,
            name: t("Brand.name"),
            description: t("Metadata.description"),
          })}
        />
      </section>

      {/* Latest articles (wireframes §2) */}
      <section
        aria-labelledby="latest-heading"
        className="border-y border-sage/30 bg-white/40"
      >
        <div className="container-page py-12">
          <h2 id="latest-heading" className="text-h2">
            {t("Home.latest")}
          </h2>
          {articles.length === 0 ? (
            <p className="mt-4 text-ink/80">
              {t("Home.empty")}{" "}
              <Link href="/about" className="text-green underline">
                {t("Nav.about")}
              </Link>
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <li key={article.slug}>
                  <ArticleCard
                    article={article}
                    categoryLabel={t(`Categories.${article.category}`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Categories — closed list D3-B only — alternating green section (design-system §119) */}
      <section
        aria-labelledby="categories-heading"
        className="on-dark bg-green text-white"
      >
        <div className="container-page py-12">
          <h2 id="categories-heading" className="text-h2">
            {t("Home.categoriesTitle")}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {categories.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/articles?category=${slug}`}
                  className="btn !py-1.5 !text-base no-underline border-2 border-white text-white"
                >
                  {t(`Categories.${slug}`)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 font-display text-xl italic text-white">
            {t("Home.quote")}
          </p>
        </div>
      </section>
    </main>
  );
}
