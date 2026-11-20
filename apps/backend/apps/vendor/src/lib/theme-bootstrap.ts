const MERCUR_THEME_KEY = "medusa_admin_theme";
const LIGHT_DEFAULT_MIGRATION_KEY = "tamadee_vendor_light_default_v1";

/**
 * Ensures the Tamadee Vendor Hub defaults to a clean white (light) theme,
 * including for existing browsers previously stuck on `"system"` / dark OS mode.
 * Users can still toggle dark mode manually afterwards in Settings if desired.
 */
export function initLightThemeDefault(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!window.localStorage.getItem(LIGHT_DEFAULT_MIGRATION_KEY)) {
      window.localStorage.setItem(MERCUR_THEME_KEY, "light");
      window.localStorage.setItem(LIGHT_DEFAULT_MIGRATION_KEY, "1");
    } else if (!window.localStorage.getItem(MERCUR_THEME_KEY)) {
      window.localStorage.setItem(MERCUR_THEME_KEY, "light");
    }
  } catch {
    // Ignore storage access restrictions (e.g. private browsing)
  }

  const persisted = (() => {
    try {
      return window.localStorage.getItem(MERCUR_THEME_KEY);
    } catch {
      return "light";
    }
  })();

  const activeTheme = persisted === "dark" ? "dark" : "light";
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(activeTheme);
  root.style.colorScheme = activeTheme;
}
