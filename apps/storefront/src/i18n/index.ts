import { DICT_EN } from "./dict-en";
import { DICT_TH } from "./dict-th";
import { DICT_ZH } from "./dict-zh";
import {
  formatPriceByLocale,
  parseAppLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
  type UiDictionary,
} from "./types";

export {
  formatPriceByLocale,
  parseAppLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
  type UiDictionary,
};

export function getUiDictionary(locale: AppLocale): UiDictionary {
  switch (locale) {
    case "en":
      return DICT_EN;
    case "zh":
      return DICT_ZH;
    case "th":
      return DICT_TH;
  }
}
