export type AppLocale = "th" | "en" | "zh";

export const SUPPORTED_LOCALES: readonly AppLocale[] = ["th", "en", "zh"];

export interface UiDictionary {
  readonly htmlLang: string;
  readonly nav: {
    readonly home: string;
    readonly categories: string;
    readonly allProducts: string;
    readonly creators: string;
    readonly sellerPortal: string;
    readonly askAi: string;
    readonly wishlist: string;
    readonly account: string;
    readonly cart: string;
    readonly searchPlaceholder: string;
    readonly searchBtn: string;
    readonly visualSearchLabel: string;
  };
  readonly home: {
    readonly heroBadge: string;
    readonly heroTitle: string;
    readonly heroDesc: string;
    readonly shopNow: string;
    readonly askAiOutfit: string;
    readonly trustApproved: string;
    readonly trustDirectShip: string;
    readonly trustVatIncluded: string;
    readonly shopByCategory: string;
    readonly categorySub: string;
    readonly viewAllCategories: string;
    readonly itemsUnit: string;
    readonly aiPicks: string;
    readonly viewAll: string;
    readonly newArrivals: string;
    readonly sortByNewest: string;
    readonly emptyCatalog: string;
  };
  readonly catalog: {
    readonly filtersTitle: string;
    readonly clearFilters: string;
    readonly keyword: string;
    readonly category: string;
    readonly allCategoriesOpt: string;
    readonly priceRange: string;
    readonly minPrice: string;
    readonly maxPrice: string;
    readonly sortBy: string;
    readonly sortRecommended: string;
    readonly sortNewest: string;
    readonly sortPriceAsc: string;
    readonly sortPriceDesc: string;
    readonly applyFilter: string;
    readonly foundCountPrefix: string;
    readonly foundCountSuffix: string;
    readonly emptySearchTitle: string;
    readonly emptySearchDesc: string;
  };
  readonly product: {
    readonly detailTitle: string;
    readonly storyHeading: string;
    readonly vatIncluded: string;
    readonly selectOptionPrefix: string;
    readonly addToCart: string;
    readonly adding: string;
    readonly buyNow: string;
    readonly addedSuccess: string;
    readonly approvedCreator: string;
    readonly shipsInPrefix: string;
    readonly shipsInSuffix: string;
  };
  readonly cart: {
    readonly title: string;
    readonly emptyTitle: string;
    readonly emptyDesc: string;
    readonly startShopping: string;
    readonly groupedSubtitle: string;
  };
  readonly ai: {
    readonly pageTitle: string;
    readonly badge: string;
    readonly welcomeTitle: string;
    readonly welcomeSub: string;
    readonly welcomeBubble: string;
    readonly inputPlaceholder: string;
    readonly thinking: string;
    readonly quickPrompts: readonly [string, string, string, string];
  };
  readonly footer: {
    readonly tagline: string;
    readonly categoriesHeading: string;
    readonly linksHeading: string;
    readonly becomeSeller: string;
  };
}

const THB_PER_USD = 34;
const THB_PER_CNY = 4.8;

export function parseAppLocale(raw: string | null | undefined): AppLocale {
  const clean = (raw ?? "").trim().toLowerCase();
  if (clean === "en" || clean.startsWith("en-")) return "en";
  if (clean === "zh" || clean.startsWith("zh-")) return "zh";
  return "th";
}

export function formatPriceByLocale(
  amountThb: number,
  locale: AppLocale
): string {
  const rounded = Math.round(amountThb);
  const sign = rounded < 0 ? "-" : "";
  const thbText = `${sign}฿${Math.abs(rounded).toLocaleString("en-US")}`;
  if (locale === "th" || rounded <= 0) {
    return thbText;
  }
  if (locale === "en") {
    const usd = Math.max(1, Math.round(rounded / THB_PER_USD));
    return `${thbText} (~$${usd.toLocaleString("en-US")})`;
  }
  const cny = Math.max(1, Math.round(rounded / THB_PER_CNY));
  return `${thbText} (~¥${cny.toLocaleString("en-US")})`;
}
