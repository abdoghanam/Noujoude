import { Link } from "@/i18n/navigation";

/* design-system §5 TagList — article tags (wireframes §10: tag flow leads
   to related content → shareable archive filter URL). */
export default function TagList({
  tags,
  label,
}: {
  tags: string[];
  label: string;
}) {
  return (
    <ul aria-label={label} className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/articles?tag=${encodeURIComponent(tag)}`}
            className="text-green underline decoration-sage/60 underline-offset-2 hover:decoration-green"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
