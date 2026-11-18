import { filterAndSortProducts } from "../../domain/catalog-logic";
import type {
  ProductCategory,
  ProductDetail,
  ProductQueryFilter,
  ProductSummary,
} from "../../domain/types";
import type { AppLocale } from "../../i18n";
import {
  localizeCategory,
  localizeProductDetail,
  localizeProductSummary,
} from "../../i18n/localize-catalog";
import { readLocaleCookie } from "../cookies";
import {
  mapCategoryDto,
  mapProductDetailDto,
  mapProductSummaryDto,
} from "../mappers/catalog-mapper";
import { MercurApiError, mercurFetch } from "../mercur-client";
import {
  CategoriesResponseSchema,
  OffersResponseSchema,
  ProductDetailResponseSchema,
  ProductsResponseSchema,
  RegionsResponseSchema,
} from "../schemas/catalog-schemas";

export { getSeller, listSellerProducts, listSellers } from "./seller-repo";

let cachedThailandRegionId: string | undefined;

export async function getThailandRegionId(): Promise<string> {
  if (cachedThailandRegionId) {
    return cachedThailandRegionId;
  }
  const data = await mercurFetch({
    path: "/store/regions",
    revalidateSeconds: 300,
    schema: RegionsResponseSchema,
  });
  const thb = data.regions.find((r) => r.currency_code.toLowerCase() === "thb");
  const chosen = thb ?? data.regions[0];
  if (!chosen) {
    throw new MercurApiError("ไม่พบภูมิภาคสกุลเงินบาท (THB) ในระบบ");
  }
  cachedThailandRegionId = chosen.id;
  return chosen.id;
}

export async function listCategories(
  localeOverride?: AppLocale
): Promise<readonly ProductCategory[]> {
  const [locale, data] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    mercurFetch({
      path: "/store/product-categories",
      query: { limit: 50 },
      revalidateSeconds: 60,
      schema: CategoriesResponseSchema,
    }),
  ]);
  return data.product_categories
    .map(mapCategoryDto)
    .sort((a, b) => a.rank - b.rank)
    .map((cat) => localizeCategory(cat, locale));
}

export async function listProducts(
  filter: ProductQueryFilter = {},
  localeOverride?: AppLocale
): Promise<readonly ProductSummary[]> {
  const [locale, regionId] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    getThailandRegionId(),
  ]);
  const data = await mercurFetch({
    path: "/store/products",
    query: {
      limit: 50,
      region_id: regionId,
      fields: "*variants.calculated_price,+variants.offer_id,*categories",
      category_id: filter.categoryId || undefined,
    },
    revalidateSeconds: 30,
    schema: ProductsResponseSchema,
  });

  const rawMapped = data.products.map(mapProductSummaryDto);
  const localized = rawMapped.map((p) => localizeProductSummary(p, locale));

  const trimmedQ = filter.q?.trim().toLowerCase();
  const matched = trimmedQ
    ? localized.filter((locProd, index) => {
        const raw = rawMapped[index];
        return (
          locProd.title.toLowerCase().includes(trimmedQ) ||
          locProd.handle.toLowerCase().includes(trimmedQ) ||
          locProd.categoryNames.some((c) => c.toLowerCase().includes(trimmedQ)) ||
          (locProd.subtitle?.toLowerCase().includes(trimmedQ) ?? false) ||
          (raw?.title.toLowerCase().includes(trimmedQ) ?? false) ||
          (raw?.subtitle?.toLowerCase().includes(trimmedQ) ?? false)
        );
      })
    : localized;

  return filterAndSortProducts(matched, {
    categoryId: filter.categoryId,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    sort: filter.sort,
  });
}

export async function getProductDetail(
  productId: string,
  localeOverride?: AppLocale
): Promise<ProductDetail> {
  const [locale, regionId] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    getThailandRegionId(),
  ]);
  const [productRes, offersRes] = await Promise.all([
    mercurFetch({
      path: `/store/products/${encodeURIComponent(productId)}`,
      query: {
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.offer_id,*categories",
      },
      revalidateSeconds: 30,
      schema: ProductDetailResponseSchema,
    }),
    mercurFetch({
      path: "/store/offers",
      query: {
        product_id: productId,
        region_id: regionId,
        limit: 50,
        fields:
          "+calculated_price,+effective_leadtime_to_ship,+seller.description,+seller.logo",
      },
      revalidateSeconds: 30,
      schema: OffersResponseSchema,
    }),
  ]);
  const detail = mapProductDetailDto(productRes.product, offersRes.offers);
  return localizeProductDetail(detail, locale);
}
