"use client";

import { useRouter } from "next/navigation";
import { useTransition, type JSX } from "react";
import { setLocaleAction } from "../../actions/locale-actions";
import type { AppLocale } from "../../i18n";
import { useLocale } from "../i18n/LocaleProvider";

const LOCALE_OPTIONS: ReadonlyArray<{
  readonly code: AppLocale;
  readonly label: string;
  readonly ariaLabel: string;
}> = [
  { code: "th", label: "TH", ariaLabel: "ภาษาไทย (Thai)" },
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "zh", label: "中文", ariaLabel: "简体中文 (Chinese)" },
];

export interface LanguageSwitcherProps {
  readonly compact?: boolean;
}

export function LanguageSwitcher({
  compact = false,
}: LanguageSwitcherProps): JSX.Element {
  const router = useRouter();
  const { locale } = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleSelect(nextLocale: AppLocale): void {
    if (nextLocale === locale || isPending) return;
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex shrink-0 items-center rounded-full border border-[#E2E2DC] bg-[#F1F1EE] p-0.5 dark:border-[#2E2E2B] dark:bg-[#1C1C1A] ${
        isPending ? "opacity-65" : ""
      }`}
    >
      {LOCALE_OPTIONS.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            disabled={isPending}
            aria-pressed={active}
            aria-label={opt.ariaLabel}
            onClick={() => handleSelect(opt.code)}
            className={`inline-flex items-center justify-center rounded-full font-extrabold transition ${
              compact
                ? "min-h-[34px] px-2.5 text-[11px]"
                : "min-h-[36px] px-3 text-xs"
            } ${
              active
                ? "bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
                : "text-[#4A4A45] hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
