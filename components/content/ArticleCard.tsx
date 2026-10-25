import { Link } from "@/i18n/navigation";
import type { ArticleMeta } from "@/lib/content";

export default function ArticleCard({
  article,
  categoryLabel,
  level = 3,
}: {
  article: ArticleMeta;
  categoryLabel: string;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <article className="rounded-sm border border-sage/40 bg-white/50 p-6">
      <p className="text-caption text-ink/70">{article.date}</p>
      <Heading className="text-h3 mt-2">
        <Link
          href={`/articles/${article.slug}`}
          className="text-green no-underline hover:underline"
        >
          {article.title}
        </Link>
      </Heading>
      <p className="mt-2 text-ink/80">{article.description}</p>
      <p className="mt-4">
        <span className="btn btn-secondary !py-1 !text-sm no-underline">
          {categoryLabel}
        </span>
      </p>
    </article>
  );
}
