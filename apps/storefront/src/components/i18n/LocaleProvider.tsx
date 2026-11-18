"use client";

import {
  createContext,
  useContext,
  useMemo,
  type JSX,
  type ReactNode,
} from "react";
import {
  formatPriceByLocale,
  getUiDictionary,
  type AppLocale,
  type UiDictionary,
} from "../../i18n";

export interface LocaleContextValue {
  readonly locale: AppLocale;
  readonly dict: UiDictionary;
  readonly formatPrice: (amountThb: number) => string;
}

const DEFAULT_VALUE: LocaleContextValue = {
  locale: "th",
  dict: getUiDictionary("th"),
  formatPrice: (amountThb: number) => formatPriceByLocale(amountThb, "th"),
};

const LocaleContext = createContext<LocaleContextValue>(DEFAULT_VALUE);

export interface LocaleProviderProps {
  readonly initialLocale: AppLocale;
  readonly children: ReactNode;
}

export function LocaleProvider({
  initialLocale,
  children,
}: LocaleProviderProps): JSX.Element {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: initialLocale,
      dict: getUiDictionary(initialLocale),
      formatPrice: (amountThb: number) =>
        formatPriceByLocale(amountThb, initialLocale),
    }),
    [initialLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
