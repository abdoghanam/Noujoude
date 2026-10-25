import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function Header() {
  const t = await getTranslations("Nav");
  const brand = await getTranslations("Brand");
  const items = [
    { href: "/", label: t("home") },
    { href: "/articles", label: t("articles") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-sage/40 bg-ivory/95 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-ink no-underline"
        >
          {brand("name")}
        </Link>

        {/* Mobile: details/summary menu (wireframes §1) */}
        <details className="group md:hidden">
          <summary className="cursor-pointer list-none rounded-sm border border-ink px-3 py-1.5 text-sm select-none">
            ☰
          </summary>
          <nav className="absolute inset-x-0 top-full border-b border-sage/40 bg-ivory p-4">
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink no-underline hover:text-green"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex items-center gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink no-underline hover:text-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
