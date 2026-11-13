import { cookies, headers } from "next/headers";
import { getStorefrontEnv } from "./env";

const JWT_COOKIE_NAME = "tamadee_jwt";
const CART_COOKIE_NAME = "tamadee_cart_id";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

async function resolveCookieOptions(): Promise<{
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
  domain?: string;
}> {
  const env = getStorefrontEnv();
  const headerStore = await headers();
  const host = (headerStore.get("host") ?? "").split(":")[0] ?? "";
  const proto = headerStore.get("x-forwarded-proto") ?? "";

  const isTamadeeDomain = host.endsWith(".tamadee.online") || host === "tamadee.online";
  const domain = isTamadeeDomain
    ? env.cookieDomain ?? ".tamadee.online"
    : undefined;
  const secure = proto === "https" || isTamadeeDomain;

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
    ...(domain ? { domain } : {}),
  };
}

export async function readCustomerToken(): Promise<string | undefined> {
  const store = await cookies();
  const val = store.get(JWT_COOKIE_NAME)?.value;
  return val && val.trim().length > 0 ? val.trim() : undefined;
}

export async function saveCustomerToken(token: string): Promise<void> {
  const store = await cookies();
  const opts = await resolveCookieOptions();
  store.set(JWT_COOKIE_NAME, token, opts);
}

export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  const opts = await resolveCookieOptions();
  store.set(JWT_COOKIE_NAME, "", { ...opts, maxAge: 0 });
}

export async function readCartIdCookie(): Promise<string | undefined> {
  const store = await cookies();
  const val = store.get(CART_COOKIE_NAME)?.value;
  return val && val.trim().length > 0 ? val.trim() : undefined;
}

export async function saveCartIdCookie(cartId: string): Promise<void> {
  const store = await cookies();
  const opts = await resolveCookieOptions();
  store.set(CART_COOKIE_NAME, cartId, opts);
}

export async function clearCartIdCookie(): Promise<void> {
  const store = await cookies();
  const opts = await resolveCookieOptions();
  store.set(CART_COOKIE_NAME, "", { ...opts, maxAge: 0 });
}
