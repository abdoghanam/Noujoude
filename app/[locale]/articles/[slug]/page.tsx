import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ArticleCard from "@/components/content/ArticleCard";
import TagList from "@/components/content/TagList";
import LangSwitcher from "@/components/LangSwitcher";
import {
  assertArticleParity,
  getArticle,
  getPublishedArticles,
  getRelatedArticles,
  isArticleLocale,
} from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import {
  JsonLdScript,
  articleJsonLd,
  breadcrumbJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  assertArticleParity();
  return getPublishedArticles("ar").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isArticleLocale(locale)) {
    return {};
  }
  const article = getArticle(locale, slug);
  if (!article) {
    return {};
  }
  return pageMetadata({
    locale,
    path: `/articles/${article.slug}`,
    title: article.title,
    description: article.description,
    type: "article",
    publishedTime: article.date,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isArticleLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const article = getArticle(locale, slug);
  if (!article) {
    notFound();
  }
  const t = await getTranslations();
  const categoryLabel = t(`Categories.${article.category}`);
  const related = getRelatedArticles(article);

  return (
    <main id="content" className="container-page py-12">
      <nav aria-label="breadcrumb" className="text-caption text-ink/70">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="text-green underline">
              {t("Nav.home")}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/articles" className="text-green underline">
              {t("Nav.articles")}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>{categoryLabel}</li>
        </ol>
      </nav>

      <h1 className="text-h1 mt-4">{article.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 text-caption text-ink/70">
        <span>
          {article.date} · {categoryLabel} ·
        </span>
        <TagList tags={article.tags} label={t("Articles.tagsLabel")} />
      </div>
      <hr className="rule-gold" />

      <JsonLdScript
        data={breadcrumbJsonLd({
          locale,
          items: [
            { name: t("Nav.home"), path: "" },
            { name: t("Nav.articles"), path: "/articles" },
            {
              name: categoryLabel,
              path: `/articles?category=${article.category}`,
            },
          ],
        })}
      />
      <JsonLdScript data={articleJsonLd({ locale, article })} />

      <div className="prose-body mt-6">{await renderMdx(article.source)}</div>

      {related.length > 0 && (
        <section
          className="mt-12 border-t border-sage/40 pt-8"
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" className="text-h2">
            {t("Articles.related")}
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ArticleCard
                  article={item}
                  categoryLabel={t(`Categories.${item.category}`)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 border-t border-sage/40 pt-6">
        <LangSwitcher />
      </footer>
    </main>
  );
}
