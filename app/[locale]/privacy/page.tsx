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
    path: "/privacy",
    title: t("Legal.privacyTitle"),
    description: t("Legal.privacyDescription"),
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="content" className="container-page py-12">
      <h1 className="text-h1">{t("Legal.privacyTitle")}</h1>
      <p className="prose-body mt-6 text-lg">{t("Legal.pending")}</p>
    </main>
  );
}
