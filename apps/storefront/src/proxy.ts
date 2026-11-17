import { NextResponse, type NextRequest } from "next/server";
import { resolveSurfaceFromHostAndQuery } from "./domain/surface";

/**
 * Next.js 16 Network Proxy: distinguishes Mobile PWA (`tamdi.tamadee.online`)
 * from Wide Desktop SEO Web (`webtamdi.tamadee.online`).
 */
export function proxy(request: NextRequest): NextResponse {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const surface = resolveSurfaceFromHostAndQuery(
    host,
    request.nextUrl.searchParams.get("surface")
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tamadee-surface", surface);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|\\.well-known/|favicon.ico|sitemap\\.xml|robots\\.txt|manifest.*|sw\\.js|icons/|app-icon\\.svg).*)",
  ],
};
