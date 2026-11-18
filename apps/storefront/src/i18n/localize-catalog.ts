import type { AiRecommendedProduct } from "../data/schemas/ai-schemas";
import type {
  ProductCategory,
  ProductDetail,
  ProductSummary,
  SellerSummary,
} from "../domain/types";
import {
  CATEGORY_EN,
  CATEGORY_NAME_TO_EN,
  PRODUCT_EN,
  SELLER_EN,
} from "./catalog-en";
import {
  CATEGORY_NAME_TO_ZH,
  CATEGORY_ZH,
  PRODUCT_ZH,
  SELLER_ZH,
} from "./catalog-zh";
import type { AppLocale } from "./types";

function translateCategoryName(name: string, locale: AppLocale): string {
  if (locale === "th") return name;
  const map = locale === "en" ? CATEGORY_NAME_TO_EN : CATEGORY_NAME_TO_ZH;
  return map[name] ?? name;
}

function translateSellerName(name: string, locale: AppLocale): string {
  if (locale === "th") return name;
  const map = locale === "en" ? SELLER_EN : SELLER_ZH;
  return map[name]?.title ?? name;
}

export function localizeCategory(
  category: ProductCategory,
  locale: AppLocale
): ProductCategory {
  if (locale === "th") return category;
  const dict = locale === "en" ? CATEGORY_EN : CATEGORY_ZH;
  const entry = dict[category.handle];
  if (!entry) {
    return {
      ...category,
      name: translateCategoryName(category.name, locale),
    };
  }
  return {
    ...category,
    name: entry.title,
    description: entry.description,
  };
}

export function localizeSeller(
  seller: SellerSummary,
  locale: AppLocale
): SellerSummary {
  if (locale === "th") return seller;
  const dict = locale === "en" ? SELLER_EN : SELLER_ZH;
  const entry = dict[seller.name];
  if (!entry) return seller;
  return {
    ...seller,
    name: entry.title,
    description: entry.description,
  };
}

export function localizeProductSummary(
  product: ProductSummary,
  locale: AppLocale
): ProductSummary {
  if (locale === "th") return product;
  const dict = locale === "en" ? PRODUCT_EN : PRODUCT_ZH;
  const entry = dict[product.handle];
  return {
    ...product,
    title: entry?.title ?? product.title,
    subtitle: entry?.description ?? product.subtitle,
    categoryNames: product.categoryNames.map((n) =>
      translateCategoryName(n, locale)
    ),
  };
}

export function localizeProductDetail(
  detail: ProductDetail,
  locale: AppLocale
): ProductDetail {
  if (locale === "th") return detail;
  const dict = locale === "en" ? PRODUCT_EN : PRODUCT_ZH;
  const sellerDict = locale === "en" ? SELLER_EN : SELLER_ZH;
  const entry = dict[detail.handle];

  return {
    ...detail,
    title: entry?.title ?? detail.title,
    description: entry?.description ?? detail.description,
    categoryNames: detail.categoryNames.map((n) =>
      translateCategoryName(n, locale)
    ),
    offers: detail.offers.map((offer) => {
      const sellerEntry = sellerDict[offer.sellerName];
      return {
        ...offer,
        sellerName: sellerEntry?.title ?? offer.sellerName,
        sellerDescription: sellerEntry?.description ?? offer.sellerDescription,
      };
    }),
  };
}

export function localizeAiProduct(
  item: AiRecommendedProduct,
  locale: AppLocale
): AiRecommendedProduct {
  if (locale === "th") return item;
  const dict = locale === "en" ? PRODUCT_EN : PRODUCT_ZH;
  const entry = dict[item.handle];
  return {
    ...item,
    title: entry?.title ?? item.title,
    description: entry?.description ?? item.description,
    sellerName: translateSellerName(item.sellerName, locale),
    categoryNames: item.categoryNames.map((n) =>
      translateCategoryName(n, locale)
    ),
  };
}
