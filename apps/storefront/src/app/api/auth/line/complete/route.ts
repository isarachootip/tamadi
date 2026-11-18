import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { readCartIdCookie, saveCustomerToken } from "../../../../../data/cookies";
import { mercurFetch } from "../../../../../data/mercur-client";
import { transferCartOwnership } from "../../../../../data/repositories/cart-repo";

const LineExchangeResponseSchema = z.object({
  token: z.string().min(1),
  displayName: z.string(),
});

function buildOriginUrl(request: NextRequest, pathname: string): URL {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.nextUrl.protocol.replace(":", "") || "https");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "tamdi.tamadee.online";
  return new URL(pathname, `${proto}://${host}`);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const exchangeCode =
    request.nextUrl.searchParams.get("exchange_code")?.trim() ?? "";

  if (!exchangeCode) {
    const errUrl = buildOriginUrl(request, "/account/login");
    errUrl.searchParams.set("line_error", "missing_code");
    return NextResponse.redirect(errUrl);
  }

  try {
    const exchanged = await mercurFetch({
      method: "POST",
      path: "/auth/line/exchange",
      body: { exchangeCode },
      schema: LineExchangeResponseSchema,
    });

    await saveCustomerToken(exchanged.token);
    const cartId = await readCartIdCookie();
    if (cartId) {
      await transferCartOwnership({
        cartId,
        bearerToken: exchanged.token,
      }).catch(() => null);
    }

    return NextResponse.redirect(buildOriginUrl(request, "/account"));
  } catch {
    const errUrl = buildOriginUrl(request, "/account/login");
    errUrl.searchParams.set("line_error", "exchange_failed");
    return NextResponse.redirect(errUrl);
  }
}
