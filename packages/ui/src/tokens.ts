export const BRAND_COLORS = {
  ink: "#111111",
  lime: "#C6F432",
  white: "#FFFFFF",
  surfaceMuted: "#F1F1EE",
  surfaceDark: "#1C1C1A",
  offWhite: "#F4F4F1",
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;
export type BrandThemeVariant = "light" | "dark";

export interface SemanticThemeTokens {
  readonly background: string;
  readonly surface: string;
  readonly foreground: string;
  readonly accent: string;
  readonly accentForeground: string;
  readonly border: string;
}

export const SEMANTIC_THEME: Record<BrandThemeVariant, SemanticThemeTokens> = {
  light: {
    background: BRAND_COLORS.white,
    surface: BRAND_COLORS.surfaceMuted,
    foreground: BRAND_COLORS.ink,
    accent: BRAND_COLORS.lime,
    accentForeground: BRAND_COLORS.ink,
    border: "#E2E2DC",
  },
  dark: {
    background: BRAND_COLORS.ink,
    surface: BRAND_COLORS.surfaceDark,
    foreground: BRAND_COLORS.white,
    accent: BRAND_COLORS.lime,
    accentForeground: BRAND_COLORS.ink,
    border: "#2E2E2B",
  },
} as const;

export const BRAND_FONTS = {
  display: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  sans: "'Anuphan', system-ui, -apple-system, sans-serif",
} as const;

export const BRAND_LAYOUT = {
  minTouchTargetPx: 44,
  mobileViewportWidthPx: 390,
  mobileMaxFramePx: 430,
  radiusSm: "0.75rem",
  radiusMd: "1rem",
  radiusLg: "1.5rem",
  radiusPill: "9999px",
} as const;
