import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Network Proxy: distinguishes Mobile PWA (`tamdi.tamadee.online`)
 * from Desktop SEO Web (`webtamdi.tamadee.online`, implemented in Phase 4).
 */
export function proxy(request: NextRequest): NextResponse {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const surface = host.startsWith("webtamdi.") ? "desktop" : "mobile";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tamadee-surface", surface);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.*|sw\\.js|icons/|app-icon\\.svg).*)",
  ],
};
