export type StorefrontSurface = "mobile" | "desktop";

export function resolveSurfaceFromHostAndQuery(
  rawHost: string | null | undefined,
  surfaceOverride?: string | null
): StorefrontSurface {
  const override = (surfaceOverride ?? "").trim().toLowerCase();
  if (override === "desktop" || override === "mobile") {
    return override;
  }

  const host = (rawHost ?? "").trim().toLowerCase();
  if (host.startsWith("webtamdi.")) {
    return "desktop";
  }

  return "mobile";
}
