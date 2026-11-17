import { headers } from "next/headers";
import {
  resolveSurfaceFromHostAndQuery,
  type StorefrontSurface,
} from "../domain/surface";

export async function getStorefrontSurface(): Promise<StorefrontSurface> {
  const reqHeaders = await headers();
  const injected = reqHeaders.get("x-tamadee-surface");
  if (injected === "desktop" || injected === "mobile") {
    return injected;
  }

  const host =
    reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  return resolveSurfaceFromHostAndQuery(host);
}
