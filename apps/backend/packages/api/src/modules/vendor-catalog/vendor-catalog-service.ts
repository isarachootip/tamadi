import type { MedusaContainer } from "@medusajs/framework/types";
import type { CreateOfferDTO } from "@mercurjs/types";
import {
  buildVariantSku,
  type CreateVendorCategoryInput,
  type QuickCreateProductInput,
  resolveProductPublishStatus,
  slugifyHandle,
} from "./schemas";
import type {
  CreatedCategoryRecord,
  CreatedOfferSummary,
  CreatedProductSummary,
  VendorCatalogDeps,
} from "./vendor-catalog-types";

export type {
  CreatedCategoryRecord,
  CreatedOfferSummary,
  CreatedProductSummary,
  CreatedProductVariantSummary,
  CreateProductWorkflowParams,
  VendorCatalogDeps,
} from "./vendor-catalog-types";

function pickUniqueHandle(baseHandle: string, existingHandles: string[]): string {
  const taken = new Set(existingHandles);
  if (!taken.has(baseHandle)) {
    return baseHandle;
  }
  let suffix = 2;
  while (taken.has(`${baseHandle}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseHandle}-${suffix}`;
}

export function createVendorCatalogService(deps: VendorCatalogDeps) {
  return {
    async createVendorCategory(
      container: MedusaContainer,
      input: CreateVendorCategoryInput
    ): Promise<CreatedCategoryRecord> {
      const baseHandle = input.handle ?? slugifyHandle(input.name, "cat");
      const existingHandles = await deps.findCategoryHandles(
        container,
        baseHandle
      );
      const uniqueHandle = pickUniqueHandle(baseHandle, existingHandles);

      return deps.createCategory(container, {
        name: input.name,
        handle: uniqueHandle,
        description: input.description,
        parent_category_id: input.parent_category_id ?? null,
        is_active: true,
      });
    },

    async createQuickProductWithOffers(
      container: MedusaContainer,
      context: { readonly sellerId: string; readonly memberId: string },
      input: QuickCreateProductInput
    ): Promise<{
      readonly product: CreatedProductSummary;
      readonly offers: CreatedOfferSummary[];
      readonly provisioned_fulfillment: boolean;
    }> {
      const [sellerStatus, fulfillment] = await Promise.all([
        deps.getSellerStatus(container, context.sellerId),
        deps.ensureFulfillmentReady(container, context.sellerId),
      ]);

      const status = resolveProductPublishStatus(
        sellerStatus,
        input.publish_immediately
      );
      const uniqueSuffix = Date.now().toString(36).slice(-5);
      const productHandle =
        input.handle ?? `${slugifyHandle(input.title, "prod")}-${uniqueSuffix}`;

      const preparedVariants = input.variants.map((variant, index) => ({
        ...variant,
        resolvedSku:
          variant.sku?.trim() ||
          buildVariantSku(context.sellerId, input.title, variant.title, index),
      }));

      const product = await deps.createProductWithVariants(container, {
        sellerId: context.sellerId,
        memberId: context.memberId,
        title: input.title,
        handle: productHandle,
        description: input.description,
        categoryId: input.category_id,
        thumbnail: input.thumbnail,
        images: input.images,
        weightGrams: input.weight_grams,
        status,
        optionTitle: input.option_title?.trim() || "ตัวเลือก",
        variants: preparedVariants.map((v) => ({
          title: v.title,
          sku: v.resolvedSku,
        })),
      });

      const offersPayload: CreateOfferDTO[] = product.variants.map(
        (createdVariant, index) => {
          const spec =
            preparedVariants.find(
              (v) =>
                (createdVariant.sku && v.resolvedSku === createdVariant.sku) ||
                v.title === createdVariant.title
            ) ?? preparedVariants[index]!;

          return {
            seller_id: context.sellerId,
            created_by: context.memberId,
            sku: spec.resolvedSku,
            variant_id: createdVariant.id,
            shipping_profile_id: fulfillment.shippingProfileId,
            inventory_items: [
              {
                sku: spec.resolvedSku,
                stock_levels: [
                  {
                    location_id: fulfillment.stockLocationId,
                    stocked_quantity: spec.stock_quantity,
                  },
                ],
              },
            ],
            prices: [{ amount: spec.price_thb, currency_code: "thb" }],
          };
        }
      );

      const offers = await deps.createOffers(container, offersPayload);

      return {
        product,
        offers,
        provisioned_fulfillment: fulfillment.provisioned,
      };
    },
  };
}
