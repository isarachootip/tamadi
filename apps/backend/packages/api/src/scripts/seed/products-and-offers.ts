import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createOffersWorkflow,
  createProductsWorkflow,
} from "@mercurjs/core/workflows";
import {
  ProductStatus,
  type CreateOfferDTO,
  type CreateProductDTO,
} from "@mercurjs/types";
import { TAMADEE_PRODUCTS } from "./catalog-data";
import { buildProductImageUrl } from "./catalog-helpers";
import {
  ensureCategoriesAndAttributes,
  type SeededAttribute,
} from "./categories-and-attributes";
import type { SeededSellerRef, TamadeeSellerSeed } from "./types";

function resolveAttrValueId(attr: SeededAttribute, name: string): string {
  const found = attr.values.find((v) => v.name === name)?.id;
  if (!found) throw new Error(`Missing attribute value "${name}"`);
  return found;
}

export async function seedProductsAndOffers(
  container: MedusaContainer,
  sellersByKey: Map<TamadeeSellerSeed["key"], SeededSellerRef>
): Promise<{ productCount: number; offerCount: number }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { categoryIdsByKey, sizeAttr, colorAttr } =
    await ensureCategoriesAndAttributes(container);

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: TAMADEE_PRODUCTS.map((p) => p.handle) },
  });
  const existingHandles = new Set(
    (existingProducts as { handle: string }[]).map((p) => p.handle)
  );
  const missingProducts = TAMADEE_PRODUCTS.filter(
    (p) => !existingHandles.has(p.handle)
  );

  if (missingProducts.length > 0) {
    logger.info(`[Tamadee Seed] Creating ${missingProducts.length} Thai products...`);
    const primaryMemberId = sellersByKey.get("lamai")!.memberId;
    const dtos: CreateProductDTO[] = missingProducts.map((item) => {
      const skuBase = item.handle.toUpperCase().replace(/-/g, "");
      const img1 = buildProductImageUrl(item.handle, 1);
      const img2 = buildProductImageUrl(item.handle, 2);
      return {
        title: item.title,
        handle: item.handle,
        description: item.description,
        category_ids: [categoryIdsByKey.get(item.category)!],
        weight: item.weightGrams,
        status: ProductStatus.PUBLISHED,
        thumbnail: img1,
        images: [{ url: img1 }, { url: img2 }],
        attributes: [
          {
            id: sizeAttr.id,
            value_ids: item.sizes.map((s) => resolveAttrValueId(sizeAttr, s)),
          },
          {
            id: colorAttr.id,
            value_ids: [resolveAttrValueId(colorAttr, item.color)],
          },
        ],
        variants: item.sizes.map((size) => ({
          title: `${size} / ${item.color}`,
          sku: `${skuBase}-${size.replace(/\s+/g, "").toUpperCase()}`,
          options: { Size: size, Color: item.color },
        })),
      };
    });

    await createProductsWorkflow(container).run({
      input: { created_by: primaryMemberId, products: dtos },
    });
  }

  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.sku"],
    filters: { handle: TAMADEE_PRODUCTS.map((p) => p.handle) },
  });
  const { data: existingOffers } = await query.graph({
    entity: "offer",
    fields: ["variant_id"],
  });
  const offeredVariantIds = new Set(
    (existingOffers as { variant_id: string }[]).map((o) => o.variant_id)
  );

  const offersToCreate: CreateOfferDTO[] = [];
  for (const prod of allProducts as {
    handle: string;
    variants: { id: string; sku: string | null }[];
  }[]) {
    const spec = TAMADEE_PRODUCTS.find((p) => p.handle === prod.handle);
    if (!spec) continue;
    const seller = sellersByKey.get(spec.seller)!;
    for (const variant of prod.variants) {
      if (offeredVariantIds.has(variant.id)) continue;
      const sku = `TMD-${spec.seller.toUpperCase()}-${variant.sku || variant.id.slice(-6)}`;
      offersToCreate.push({
        seller_id: seller.id,
        created_by: seller.memberId,
        sku,
        variant_id: variant.id,
        shipping_profile_id: seller.shippingProfileId,
        inventory_items: [
          {
            sku,
            stock_levels: [
              { location_id: seller.stockLocationId, stocked_quantity: 50 },
            ],
          },
        ],
        prices: [{ amount: spec.priceThb, currency_code: "thb" }],
      });
    }
  }

  if (offersToCreate.length > 0) {
    logger.info(`[Tamadee Seed] Creating ${offersToCreate.length} THB seller offers...`);
    await createOffersWorkflow(container).run({
      input: { offers: offersToCreate },
    });
  }

  return {
    productCount: allProducts.length,
    offerCount: offeredVariantIds.size + offersToCreate.length,
  };
}
