import type { MedusaContainer } from "@medusajs/framework/types";
import type { CreateOfferDTO, ProductStatus } from "@mercurjs/types";
import type { SellerFulfillmentReadyResult } from "./seller-fulfillment-provisioner";

export interface CreatedCategoryRecord {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly description: string;
  readonly is_active: boolean;
}

export interface CreatedProductVariantSummary {
  readonly id: string;
  readonly title: string;
  readonly sku: string | null;
}

export interface CreatedProductSummary {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly status: string;
  readonly variants: CreatedProductVariantSummary[];
}

export interface CreatedOfferSummary {
  readonly id: string;
  readonly variant_id: string;
  readonly sku: string | null;
}

export interface CreateProductWorkflowParams {
  readonly sellerId: string;
  readonly memberId: string;
  readonly title: string;
  readonly handle: string;
  readonly description?: string;
  readonly categoryId?: string | null;
  readonly thumbnail?: string;
  readonly images?: string[];
  readonly weightGrams?: number;
  readonly status: ProductStatus;
  readonly optionTitle: string;
  readonly variants: Array<{ readonly title: string; readonly sku: string }>;
}

export interface UpdatedProductMediaSummary {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly status: string;
  readonly thumbnail: string | null;
  readonly images: Array<{ readonly url: string }>;
}

export interface UpdateProductMediaRecordParams {
  readonly productId: string;
  readonly thumbnail: string | null;
  readonly images: string[];
  readonly status?: ProductStatus;
}

export interface VendorCatalogDeps {
  findCategoryHandles: (
    container: MedusaContainer,
    baseHandle: string
  ) => Promise<string[]>;
  createCategory: (
    container: MedusaContainer,
    input: {
      name: string;
      handle: string;
      description?: string;
      parent_category_id?: string | null;
      is_active: boolean;
    }
  ) => Promise<CreatedCategoryRecord>;
  getSellerStatus: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<string>;
  approveSeller: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<void>;
  sellerOwnsProduct: (
    container: MedusaContainer,
    sellerId: string,
    productId: string
  ) => Promise<boolean>;
  updateProductMediaRecord: (
    container: MedusaContainer,
    params: UpdateProductMediaRecordParams
  ) => Promise<UpdatedProductMediaSummary>;
  ensureFulfillmentReady: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<SellerFulfillmentReadyResult>;
  createProductWithVariants: (
    container: MedusaContainer,
    params: CreateProductWorkflowParams
  ) => Promise<CreatedProductSummary>;
  createOffers: (
    container: MedusaContainer,
    offers: CreateOfferDTO[]
  ) => Promise<CreatedOfferSummary[]>;
}
