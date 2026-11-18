import type { ProductSummary, SellerSummary } from "../../domain/types";
import type { AppLocale } from "../../i18n";
import {
  localizeProductSummary,
  localizeSeller,
} from "../../i18n/localize-catalog";
import { readLocaleCookie } from "../cookies";
import { mapOfferToProductSummary, mapSellerDto } from "../mappers/catalog-mapper";
import { mercurFetch } from "../mercur-client";
import {
  OffersResponseSchema,
  SellersResponseSchema,
  SingleSellerResponseSchema,
} from "../schemas/catalog-schemas";
import { getThailandRegionId } from "./catalog-repo";

export async function listSellers(
  localeOverride?: AppLocale
): Promise<readonly SellerSummary[]> {
  const [locale, data] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    mercurFetch({
      path: "/store/sellers",
      query: { limit: 50, fields: "+default_leadtime_to_ship" },
      revalidateSeconds: 60,
      schema: SellersResponseSchema,
    }),
  ]);
  return data.sellers.map(mapSellerDto).map((s) => localizeSeller(s, locale));
}

export async function getSeller(
  sellerId: string,
  localeOverride?: AppLocale
): Promise<SellerSummary> {
  const [locale, data] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    mercurFetch({
      path: `/store/sellers/${encodeURIComponent(sellerId)}`,
      query: { fields: "+default_leadtime_to_ship" },
      revalidateSeconds: 60,
      schema: SingleSellerResponseSchema,
    }),
  ]);
  return localizeSeller(mapSellerDto(data.seller), locale);
}

export async function listSellerProducts(
  sellerId: string,
  localeOverride?: AppLocale
): Promise<readonly ProductSummary[]> {
  const [locale, regionId] = await Promise.all([
    localeOverride ? Promise.resolve(localeOverride) : readLocaleCookie(),
    getThailandRegionId(),
  ]);
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
      deduped.set(summary.id, localizeProductSummary(summary, locale));
    }
  }
  return Array.from(deduped.values());
}
