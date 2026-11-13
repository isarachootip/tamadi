import type {
  ProductDetail,
  ProductQueryFilter,
  ProductSummary,
  ProductVariantModel,
  SellerOfferModel,
} from "./types";

export function buildGalleryUrls(detail: ProductDetail): readonly string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  if (detail.thumbnail && detail.thumbnail.trim().length > 0) {
    seen.add(detail.thumbnail);
    urls.push(detail.thumbnail);
  }
  for (const img of detail.images) {
    if (img.trim().length > 0 && !seen.has(img)) {
      seen.add(img);
      urls.push(img);
    }
  }
  return urls;
}

export function findMatchingVariant(
  detail: ProductDetail,
  selectedOptions: Readonly<Record<string, string>>
): ProductVariantModel | undefined {
  if (detail.variants.length === 0) {
    return undefined;
  }
  for (const variant of detail.variants) {
    let matchesAll = true;
    for (const [optId, optValue] of Object.entries(selectedOptions)) {
      if (variant.optionValues[optId] !== optValue) {
        matchesAll = false;
        break;
      }
    }
    if (matchesAll) {
      return variant;
    }
  }
  return detail.variants[0];
}

export function findOfferForVariant(
  detail: ProductDetail,
  variantId: string | undefined
): SellerOfferModel | undefined {
  if (detail.offers.length === 0) {
    return undefined;
  }
  if (variantId) {
    const exact = detail.offers.find((offer) => offer.variantId === variantId);
    if (exact) {
      return exact;
    }
  }
  return detail.offers[0];
}

export function filterAndSortProducts(
  items: readonly ProductSummary[],
  filter: ProductQueryFilter
): readonly ProductSummary[] {
  let result = [...items];

  if (filter.q && filter.q.trim().length > 0) {
    const keyword = filter.q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword) ||
        (p.subtitle?.toLowerCase().includes(keyword) ?? false)
    );
  }
  if (filter.categoryId && filter.categoryId.length > 0) {
    result = result.filter((p) => p.categoryIds.includes(filter.categoryId!));
  }
  if (typeof filter.minPrice === "number") {
    result = result.filter((p) => p.priceAmount >= filter.minPrice!);
  }
  if (typeof filter.maxPrice === "number") {
    result = result.filter((p) => p.priceAmount <= filter.maxPrice!);
  }

  if (filter.sort === "price_asc") {
    result.sort((a, b) => a.priceAmount - b.priceAmount);
  } else if (filter.sort === "price_desc") {
    result.sort((a, b) => b.priceAmount - a.priceAmount);
  }

  return result;
}
