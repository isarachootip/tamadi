import {
  formatPriceByLocale,
  getUiDictionary,
  type AppLocale,
  type UiDictionary,
} from "../i18n";
import { readLocaleCookie } from "./cookies";

export interface ServerI18nContext {
  readonly locale: AppLocale;
  readonly dict: UiDictionary;
  readonly formatPrice: (amountThb: number) => string;
}

export async function getServerI18n(): Promise<ServerI18nContext> {
  const locale = await readLocaleCookie();
  const dict = getUiDictionary(locale);
  return {
    locale,
    dict,
    formatPrice: (amountThb: number) => formatPriceByLocale(amountThb, locale),
  };
}
