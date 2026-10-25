import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import LangSwitcher from "./LangSwitcher";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");

  return (
    <footer className="border-t border-sage/40 bg-ivory">
      <div className="container-page flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <li>
              <Link
                href="/about"
                className="text-ink no-underline hover:text-green"
              >
                {nav("about")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-ink no-underline hover:text-green"
              >
                {nav("contact")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-ink no-underline hover:text-green"
              >
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-ink no-underline hover:text-green"
              >
                {t("terms")}
              </Link>
            </li>
            <li>
              <LangSwitcher />
            </li>
          </ul>
        </nav>
        <p className="text-caption text-ink/70">{t("rights")}</p>
      </div>
    </footer>
  );
}
