"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveLocaleCookie } from "../data/cookies";
import type { AppLocale } from "../i18n";

const LocaleInputSchema = z.enum(["th", "en", "zh"]);

export interface SetLocaleActionResult {
  readonly ok: boolean;
  readonly locale: AppLocale;
}

export async function setLocaleAction(
  rawLocale: string
): Promise<SetLocaleActionResult> {
  const parsed = LocaleInputSchema.safeParse(rawLocale.trim().toLowerCase());
  const nextLocale: AppLocale = parsed.success ? parsed.data : "th";

  await saveLocaleCookie(nextLocale);
  revalidatePath("/", "layout");

  return { ok: true, locale: nextLocale };
}
