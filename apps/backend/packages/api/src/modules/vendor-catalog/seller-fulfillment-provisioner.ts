import type { MedusaContainer } from "@medusajs/framework/types";

export const DEFAULT_SELLER_SHIPPING_FEE_THB = 45;

export interface SellerFulfillmentSnapshot {
  readonly sellerName: string;
  readonly existingStockLocationId?: string;
  readonly shippingProfileId?: string;
  readonly salesChannelId?: string;
  readonly regionId?: string;
}

export interface ProvisionWarehouseParams {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly shippingProfileId: string;
  readonly salesChannelId?: string;
  readonly regionId?: string;
  readonly defaultShippingFeeThb: number;
}

export interface SellerFulfillmentDeps {
  getSellerFulfillmentSnapshot: (
    container: MedusaContainer,
    sellerId: string
  ) => Promise<SellerFulfillmentSnapshot>;
  createShippingProfile: (container: MedusaContainer) => Promise<string>;
  provisionWarehouseAndShipping: (
    container: MedusaContainer,
    params: ProvisionWarehouseParams
  ) => Promise<string>;
}

export interface SellerFulfillmentReadyResult {
  readonly stockLocationId: string;
  readonly shippingProfileId: string;
  readonly provisioned: boolean;
}

export function createEnsureSellerFulfillmentReady(
  deps: SellerFulfillmentDeps
) {
  return async function ensureSellerFulfillmentReady(
    container: MedusaContainer,
    sellerId: string
  ): Promise<SellerFulfillmentReadyResult> {
    const snapshot = await deps.getSellerFulfillmentSnapshot(
      container,
      sellerId
    );
    const shippingProfileId =
      snapshot.shippingProfileId ??
      (await deps.createShippingProfile(container));

    if (snapshot.existingStockLocationId) {
      return {
        stockLocationId: snapshot.existingStockLocationId,
        shippingProfileId,
        provisioned: false,
      };
    }

    const stockLocationId = await deps.provisionWarehouseAndShipping(
      container,
      {
        sellerId,
        sellerName: snapshot.sellerName,
        shippingProfileId,
        salesChannelId: snapshot.salesChannelId,
        regionId: snapshot.regionId,
        defaultShippingFeeThb: DEFAULT_SELLER_SHIPPING_FEE_THB,
      }
    );

    return {
      stockLocationId,
      shippingProfileId,
      provisioned: true,
    };
  };
}
