"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useThemePreference, type ThemePreference } from "./ThemeProvider";

const OPTIONS: readonly {
  readonly value: ThemePreference;
  readonly label: string;
  readonly Icon: typeof Sun;
}[] = [
  { value: "light", label: "โหมดสว่าง", Icon: Sun },
  { value: "dark", label: "โหมดมืด", Icon: Moon },
  { value: "system", label: "ตามระบบ", Icon: Monitor },
];

export function ThemeModeSelector(): JSX.Element {
  const { preference, setPreference } = useThemePreference();

  return (
    <div
      role="group"
      aria-label="เลือกโหมดสีหน้าจอ"
      className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F1F1EE] p-1.5 dark:bg-[#1C1C1A]"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-pressed={active}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition ${
              active
                ? "bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
                : "text-[#111111] hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
