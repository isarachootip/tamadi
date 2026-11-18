import { z } from "@medusajs/framework/zod";
import type { AiCatalogItem } from "./types";

const StoreRegionsSchema = z.object({
  regions: z.array(
    z.object({
      id: z.string(),
      currency_code: z.string(),
    })
  ),
});

const StoreProductsSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      handle: z.string(),
      description: z.string().nullable().optional(),
      thumbnail: z.string().nullable().optional(),
      categories: z.array(z.object({ name: z.string() })).optional(),
      variants: z
        .array(
          z.object({
            id: z.string(),
            title: z.string().nullable().optional(),
            offer_id: z.string().nullable().optional(),
            calculated_price: z
              .object({
                calculated_amount: z.number().nullable().optional(),
              })
              .nullable()
              .optional(),
          })
        )
        .optional(),
    })
  ),
});

const StoreOffersSchema = z.object({
  offers: z.array(
    z.object({
      id: z.string(),
      variant_id: z.string().nullable().optional(),
      seller: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .nullable()
        .optional(),
      calculated_price: z
        .object({
          calculated_amount: z.number().nullable().optional(),
        })
        .nullable()
        .optional(),
    })
  ),
});

let cachedCatalog: { expiresAt: number; items: readonly AiCatalogItem[] } | null =
  null;

export async function loadLiveStoreCatalog(
  publishableApiKey: string
): Promise<readonly AiCatalogItem[]> {
  const now = Date.now();
  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.items;
  }

  const port = process.env.PORT || "9000";
  const baseUrl = `http://127.0.0.1:${port}`;
  const reqHeaders = {
    Accept: "application/json",
    "x-publishable-api-key": publishableApiKey,
  };

  const regRes = await fetch(`${baseUrl}/store/regions`, { headers: reqHeaders });
  if (!regRes.ok) {
    return [];
  }
  const regions = StoreRegionsSchema.parse(await regRes.json()).regions;
  const thRegion =
    regions.find((r) => r.currency_code.toLowerCase() === "thb") ?? regions[0];
  if (!thRegion) {
    return [];
  }

  const [prodRes, offerRes] = await Promise.all([
    fetch(
      `${baseUrl}/store/products?limit=100&region_id=${encodeURIComponent(thRegion.id)}&fields=*variants.calculated_price,+variants.offer_id,*categories`,
      { headers: reqHeaders }
    ),
    fetch(
      `${baseUrl}/store/offers?limit=200&region_id=${encodeURIComponent(thRegion.id)}`,
      { headers: reqHeaders }
    ),
  ]);

  if (!prodRes.ok) {
    return [];
  }

  const products = StoreProductsSchema.parse(await prodRes.json()).products;
  const offers = offerRes.ok
    ? StoreOffersSchema.parse(await offerRes.json()).offers
    : [];

  const offerByVariant = new Map(
    offers.filter((o) => Boolean(o.variant_id)).map((o) => [o.variant_id!, o])
  );
  const offerById = new Map(offers.map((o) => [o.id, o]));

  const items: AiCatalogItem[] = [];
  for (const product of products) {
    const firstVar = product.variants?.[0];
    if (!firstVar) continue;
    const offer =
      (firstVar.offer_id ? offerById.get(firstVar.offer_id) : undefined) ??
      offerByVariant.get(firstVar.id);
    const offerId = offer?.id ?? firstVar.offer_id ?? "";
    if (!offerId) continue;

    const rawPrice =
      offer?.calculated_price?.calculated_amount ??
      firstVar.calculated_price?.calculated_amount ??
      0;
    const priceAmount = Math.round(rawPrice);
    if (priceAmount <= 0) continue;

    items.push({
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description ?? undefined,
      thumbnail: product.thumbnail ?? undefined,
      categoryNames: (product.categories ?? []).map((c) => c.name),
      priceAmount,
      offerId,
      variantId: firstVar.id,
      variantTitle: firstVar.title ?? "มาตรฐาน",
      sellerId: offer?.seller?.id ?? "seller_tamadee",
      sellerName: offer?.seller?.name ?? "สตูดิโอทำมาดี",
    });
  }

  cachedCatalog = { expiresAt: now + 30_000, items };
  return items;
}
