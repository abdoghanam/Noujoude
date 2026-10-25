import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations("NotFound");
  const other = locale === "ar" ? "en" : "ar";

  return (
    <main id="content" className="container-page py-24 text-center">
      <p className="text-display text-green">{t("code")}</p>
      <h1 className="text-h1 mt-4 text-ink">{t("message")}</h1>
      <p className="mt-10">
        <Link href="/" className="btn btn-primary">
          {t("home")}
        </Link>
      </p>
      <p className="mt-4">
        <Link
          href="/"
          locale={other}
          hrefLang={other}
          className="text-green underline"
        >
          {t("switchLocale")}
        </Link>
      </p>
    </main>
  );
}
