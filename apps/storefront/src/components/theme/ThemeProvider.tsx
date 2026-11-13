"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  readonly preference: ThemePreference;
  readonly resolvedTheme: "light" | "dark";
  readonly setPreference: (next: ThemePreference) => void;
}

const STORAGE_KEY = "tamadee_theme_pref";

const ThemeContext = createContext<ThemeContextValue>({
  preference: "light",
  resolvedTheme: "light",
  setPreference: () => undefined,
});

function resolveEffectiveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "light" || pref === "dark") {
    return pref;
  }
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyDomTheme(effective: "light" | "dark"): void {
  const root = document.documentElement;
  root.classList.toggle("dark", effective === "dark");
  root.dataset["theme"] = effective;
}

export function ThemeProvider({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemePreference =
      saved === "dark" || saved === "system" || saved === "light"
        ? saved
        : "light";
    setPreferenceState(initial);
    const effective = resolveEffectiveTheme(initial);
    setResolvedTheme(effective);
    applyDomTheme(effective);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const effective = resolveEffectiveTheme(next);
    setResolvedTheme(effective);
    applyDomTheme(effective);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference(): ThemeContextValue {
  return useContext(ThemeContext);
}
