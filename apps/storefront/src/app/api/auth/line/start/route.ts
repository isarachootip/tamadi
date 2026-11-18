import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest): NextResponse {
  const publicBackend = (
    process.env["NEXT_PUBLIC_API_BASE_URL"] ??
    process.env["MERCUR_BACKEND_URL"] ??
    "https://bwebtamdi.tamadee.online"
  ).replace(/\/+$/, "");

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.nextUrl.protocol.replace(":", "") || "https");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "tamdi.tamadee.online";

  const returnTo = `${proto}://${host}/api/auth/line/complete`;
  const target = new URL(`${publicBackend}/auth/line/start`);
  target.searchParams.set("return_to", returnTo);

  return NextResponse.redirect(target);
}
