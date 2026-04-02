import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ja", "en"];
const defaultLocale = "ja";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if pathname already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (hasLocale) return;

  // Detect preferred language from Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  const preferred = acceptLang.includes("ja") ? "ja" : defaultLocale;

  // Redirect to localized path
  request.nextUrl.pathname = `/${preferred}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
