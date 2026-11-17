"use client";

import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useThemePreference } from "../theme/ThemeProvider";

export function DesktopThemeButton(): JSX.Element {
  const { resolvedTheme, setPreference } = useThemePreference();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setPreference(isDark ? "light" : "dark")}
      aria-label={isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:hover:border-[#C6F432]"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#C6F432]" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
