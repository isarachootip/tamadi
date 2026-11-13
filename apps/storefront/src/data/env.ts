import { z } from "zod";

const StorefrontEnvSchema = z.object({
  mercurBackendUrl: z.string().url(),
  publishableKey: z.string(),
  siteUrl: z.string().url(),
  cookieDomain: z.string().optional(),
});

export type StorefrontEnv = z.infer<typeof StorefrontEnvSchema>;

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getStorefrontEnv(): StorefrontEnv {
  const rawBackend =
    process.env["MERCUR_BACKEND_URL"] ??
    process.env["NEXT_PUBLIC_API_BASE_URL"] ??
    "http://127.0.0.1:9000";
  const rawSite =
    process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://tamdi.tamadee.online";
  const rawKey = (process.env["NEXT_PUBLIC_PUBLISHABLE_KEY"] ?? "").trim();
  const rawCookieDomain = (process.env["COOKIE_DOMAIN"] ?? "").trim();

  return StorefrontEnvSchema.parse({
    mercurBackendUrl: stripTrailingSlash(rawBackend.trim()),
    publishableKey: rawKey,
    siteUrl: stripTrailingSlash(rawSite.trim()),
    cookieDomain: rawCookieDomain.length > 0 ? rawCookieDomain : undefined,
  });
}
