import type { MedusaContainer } from "@medusajs/framework/types";
import { type CreateOfferDTO, SellerStatus } from "@mercurjs/types";
import {
  buildVariantSku,
  type CreateVendorCategoryInput,
  type QuickCreateProductInput,
  resolveProductPublishStatus,
  slugifyHandle,
  type UpdateProductMediaInput,
} from "./schemas";
import type {
  CreatedCategoryRecord,
  CreatedOfferSummary,
  CreatedProductSummary,
  UpdatedProductMediaSummary,
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

function pickUniqueHandle(base: string, existing: string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

async function resolveEffectiveSellerStatus(
  deps: VendorCatalogDeps,
  container: MedusaContainer,
  sellerId: string
): Promise<string> {
  const status = await deps.getSellerStatus(container, sellerId);
  if (status === SellerStatus.PENDING_APPROVAL) {
    await deps.approveSeller(container, sellerId);
    return SellerStatus.OPEN;
  }
  return status;
}

export function createVendorCatalogService(deps: VendorCatalogDeps) {
  return {
    async createVendorCategory(
      container: MedusaContainer,
      input: CreateVendorCategoryInput
    ): Promise<CreatedCategoryRecord> {
      const baseHandle = input.handle ?? slugifyHandle(input.name, "cat");
      const existingHandles = await deps.findCategoryHandles(container, baseHandle);
      return deps.createCategory(container, {
        name: input.name,
        handle: pickUniqueHandle(baseHandle, existingHandles),
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
        resolveEffectiveSellerStatus(deps, container, context.sellerId),
        deps.ensureFulfillmentReady(container, context.sellerId),
      ]);

      const status = resolveProductPublishStatus(
        sellerStatus,
        input.publish_immediately
      );
      const uniqueSuffix = Date.now().toString(36).slice(-5);
      const productHandle =
        input.handle ?? `${slugifyHandle(input.title, "prod")}-${uniqueSuffix}`;
      const resolvedThumbnail = input.thumbnail ?? input.images?.[0];

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
        thumbnail: resolvedThumbnail,
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

    async updateProductMedia(
      container: MedusaContainer,
      context: { readonly sellerId: string; readonly productId: string },
      input: UpdateProductMediaInput
    ): Promise<UpdatedProductMediaSummary> {
      const ownsProduct = await deps.sellerOwnsProduct(
        container,
        context.sellerId,
        context.productId
      );
      if (!ownsProduct) {
        throw new Error("ไม่พบสินค้านี้หรือคุณไม่มีสิทธิ์แก้ไข");
      }

      const uniqueImages = Array.from(
        new Set([
          ...(input.thumbnail ? [input.thumbnail] : []),
          ...input.images,
        ])
      );
      const resolvedThumbnail =
        input.thumbnail === null
          ? uniqueImages[0] ?? null
          : input.thumbnail ?? uniqueImages[0] ?? null;

      let nextStatus: ReturnType<typeof resolveProductPublishStatus> | undefined;
      if (input.publish_immediately !== undefined) {
        const sellerStatus = await resolveEffectiveSellerStatus(
          deps,
          container,
          context.sellerId
        );
        nextStatus = resolveProductPublishStatus(
          sellerStatus,
          input.publish_immediately
        );
      }

      return deps.updateProductMediaRecord(container, {
        productId: context.productId,
        thumbnail: resolvedThumbnail,
        images: uniqueImages,
        status: nextStatus,
      });
    },
  };
}
