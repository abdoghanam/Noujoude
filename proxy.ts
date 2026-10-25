import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";
  const isKnownLocale = (routing.locales as readonly string[]).includes(
    firstSegment,
  );

  /* Unknown locale-like prefix (e.g. /fr): rewrite under a valid locale's
     unmatched space instead of next-intl's 307 redirect — GET /fr answers
     404 directly (URL unchanged, branded SSR page, requirement Q1-A #8). */
  if (firstSegment !== "" && !isKnownLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/ar${pathname}`;
    return NextResponse.rewrite(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
