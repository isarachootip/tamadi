import { filterAndSortProducts } from "../../domain/catalog-logic";
import type {
  ProductCategory,
  ProductDetail,
  ProductQueryFilter,
  ProductSummary,
  SellerSummary,
} from "../../domain/types";
import {
  mapCategoryDto,
  mapOfferToProductSummary,
  mapProductDetailDto,
  mapProductSummaryDto,
  mapSellerDto,
} from "../mappers/catalog-mapper";
import { MercurApiError, mercurFetch } from "../mercur-client";
import {
  CategoriesResponseSchema,
  OffersResponseSchema,
  ProductDetailResponseSchema,
  ProductsResponseSchema,
  RegionsResponseSchema,
  SellersResponseSchema,
  SingleSellerResponseSchema,
} from "../schemas/catalog-schemas";

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

export async function listCategories(): Promise<readonly ProductCategory[]> {
  const data = await mercurFetch({
    path: "/store/product-categories",
    query: { limit: 50 },
    revalidateSeconds: 60,
    schema: CategoriesResponseSchema,
  });
  return data.product_categories
    .map(mapCategoryDto)
    .sort((a, b) => a.rank - b.rank);
}

export async function listProducts(
  filter: ProductQueryFilter = {}
): Promise<readonly ProductSummary[]> {
  const regionId = await getThailandRegionId();
  const data = await mercurFetch({
    path: "/store/products",
    query: {
      limit: 50,
      region_id: regionId,
      fields: "*variants.calculated_price,+variants.offer_id,*categories",
      q: filter.q?.trim() || undefined,
      category_id: filter.categoryId || undefined,
    },
    revalidateSeconds: 30,
    schema: ProductsResponseSchema,
  });
  const mapped = data.products.map(mapProductSummaryDto);
  return filterAndSortProducts(mapped, {
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    sort: filter.sort,
  });
}

export async function getProductDetail(productId: string): Promise<ProductDetail> {
  const regionId = await getThailandRegionId();
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
  return mapProductDetailDto(productRes.product, offersRes.offers);
}

export async function listSellers(): Promise<readonly SellerSummary[]> {
  const data = await mercurFetch({
    path: "/store/sellers",
    query: { limit: 50, fields: "+default_leadtime_to_ship" },
    revalidateSeconds: 60,
    schema: SellersResponseSchema,
  });
  return data.sellers.map(mapSellerDto);
}

export async function getSeller(sellerId: string): Promise<SellerSummary> {
  const data = await mercurFetch({
    path: `/store/sellers/${encodeURIComponent(sellerId)}`,
    query: { fields: "+default_leadtime_to_ship" },
    revalidateSeconds: 60,
    schema: SingleSellerResponseSchema,
  });
  return mapSellerDto(data.seller);
}

export async function listSellerProducts(
  sellerId: string
): Promise<readonly ProductSummary[]> {
  const regionId = await getThailandRegionId();
  const data = await mercurFetch({
    path: "/store/offers",
    query: {
      seller_id: sellerId,
      region_id: regionId,
      limit: 50,
      fields:
        "+calculated_price,+product.id,+product.title,+product.subtitle,+product.handle,+product.thumbnail",
    },
    revalidateSeconds: 30,
    schema: OffersResponseSchema,
  });
  const deduped = new Map<string, ProductSummary>();
  for (const offer of data.offers) {
    const summary = mapOfferToProductSummary(offer);
    if (summary && !deduped.has(summary.id)) {
      deduped.set(summary.id, summary);
    }
  }
  return Array.from(deduped.values());
}
