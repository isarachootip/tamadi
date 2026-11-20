import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";
import {
  createOffersWorkflow,
  createProductsWorkflow,
} from "@mercurjs/core/workflows";
import type { CreateOfferDTO, CreateProductDTO } from "@mercurjs/types";
import { defaultSellerFulfillmentDeps } from "./seller-fulfillment-adapters";
import { createEnsureSellerFulfillmentReady } from "./seller-fulfillment-provisioner";
import {
  createVendorCatalogService,
  type CreatedProductSummary,
  type VendorCatalogDeps,
} from "./vendor-catalog-service";

const ensureSellerFulfillmentReady = createEnsureSellerFulfillmentReady(
  defaultSellerFulfillmentDeps
);

export const defaultVendorCatalogDeps: VendorCatalogDeps = {
  async findCategoryHandles(container: MedusaContainer, baseHandle: string) {
    const productModule = container.resolve(Modules.PRODUCT);
    const categories = await productModule.listProductCategories(
      {},
      { select: ["handle"] }
    );
    return categories
      .map((cat) => cat.handle)
      .filter((h): h is string => Boolean(h) && h.startsWith(baseHandle));
  },

  async createCategory(container, input) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: input.name,
            handle: input.handle,
            description: input.description ?? "",
            parent_category_id: input.parent_category_id ?? null,
            is_active: input.is_active,
          },
        ],
      },
    });
    const created = result[0];
    return {
      id: created.id,
      name: created.name,
      handle: created.handle,
      description: created.description ?? "",
      is_active: created.is_active,
    };
  },

  async getSellerStatus(container, sellerId) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
      entity: "seller",
      fields: ["id", "status"],
      filters: { id: sellerId },
    });
    return (
      (data as Array<{ status?: string }>)[0]?.status ?? "pending_approval"
    );
  },

  ensureFulfillmentReady: ensureSellerFulfillmentReady,

  async createProductWithVariants(container, params) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const hasMultipleVariants = params.variants.length > 1;
    const imageUrls = Array.from(
      new Set([
        ...(params.thumbnail ? [params.thumbnail] : []),
        ...(params.images ?? []),
      ])
    );

    const dto: CreateProductDTO & { seller_ids?: string[] } = {
      title: params.title,
      handle: params.handle,
      description: params.description,
      status: params.status,
      seller_ids: [params.sellerId],
      ...(params.categoryId ? { category_ids: [params.categoryId] } : {}),
      ...(params.weightGrams ? { weight: params.weightGrams } : {}),
      ...(imageUrls[0] ? { thumbnail: imageUrls[0] } : {}),
      ...(imageUrls.length > 0
        ? { images: imageUrls.map((url) => ({ url })) }
        : {}),
      ...(hasMultipleVariants
        ? {
            attributes: [
              {
                title: params.optionTitle,
                is_variant_axis: true,
                values: params.variants.map((v) => v.title),
              },
            ],
          }
        : {}),
      variants: params.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        ...(hasMultipleVariants
          ? { options: { [params.optionTitle]: v.title } }
          : {}),
      })),
    };

    const { result } = await createProductsWorkflow(container).run({
      input: {
        created_by: params.sellerId,
        products: [dto],
      },
    });

    const createdId = result[0].id;
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "status",
        "variants.id",
        "variants.title",
        "variants.sku",
      ],
      filters: { id: createdId },
    });

    return (data as CreatedProductSummary[])[0];
  },

  async createOffers(container: MedusaContainer, offers: CreateOfferDTO[]) {
    const { result } = await createOffersWorkflow(container).run({
      input: { offers },
    });
    return (
      result as Array<{ id: string; variant_id: string; sku?: string | null }>
    ).map((offer) => ({
      id: offer.id,
      variant_id: offer.variant_id,
      sku: offer.sku ?? null,
    }));
  },
};

export const vendorCatalogService = createVendorCatalogService(
  defaultVendorCatalogDeps
);
