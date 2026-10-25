import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

/* Catch-all exists only to reject unknown paths. With no static params +
   dynamicParams=false it never matches → 404 falls through to the root
   not-found boundary, which SSRs a full bilingual document (verified). */
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
