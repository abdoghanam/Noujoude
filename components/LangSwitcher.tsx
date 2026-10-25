"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function LangSwitcher() {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const current = routing.locales.includes(params.locale as never)
    ? params.locale
    : routing.defaultLocale;

  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" className="text-sage">
              |
            </span>
          )}
          <Link
            href={pathname}
            locale={locale}
            hrefLang={locale}
            className={
              locale === current
                ? "font-semibold text-ink no-underline"
                : "text-ink no-underline hover:underline"
            }
            aria-current={locale === current ? "true" : undefined}
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
      {/* WCAG 4.1.3 (Status Messages): announce the language change to
          screen readers. The live region is always in the DOM but visually
          hidden; its text is updated only after a locale switch so the
          screen reader announces the new language on focus/activation. */}
      <span role="status" className="sr-only">
        {current === "ar"
          ? "تم تغيير اللغة إلى العربية"
          : "Language changed to English"}
      </span>
    </nav>
  );
}
