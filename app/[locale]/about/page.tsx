import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata({
    locale,
    path: "/about",
    title: t("About.title"),
    description: t("About.description"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="content" className="container-page py-12">
      <h1 className="text-h1">{t("About.title")}</h1>
      {/* Brand copy — exact strings from docs/identity/brand-board.html (approved P2-A) */}
      <section className="prose-body mt-8">
        <p className="text-lg">{t("About.story")}</p>
        <h2 className="text-h2 mt-10">{t("About.missionTitle")}</h2>
        <p className="mt-3">{t("About.mission")}</p>
        <h2 className="text-h2 mt-10">{t("About.visionTitle")}</h2>
        <p className="mt-3">{t("About.vision")}</p>
        <p className="mt-10 text-ink/70">{t("About.ownerPending")}</p>
      </section>
    </main>
  );
}
