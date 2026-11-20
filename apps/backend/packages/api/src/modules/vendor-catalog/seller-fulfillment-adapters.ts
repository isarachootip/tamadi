import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingProfilesWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createSellerShippingOptionsWorkflow,
  createSellerStockLocationsWorkflow,
} from "@mercurjs/core/workflows";
import type { SellerFulfillmentDeps } from "./seller-fulfillment-provisioner";

const DEFAULT_SHIPPING_PROFILE_NAME = "Marketplace Shipping";

interface GraphSellerRow {
  id: string;
  name?: string | null;
  stock_locations?: Array<{ id: string }>;
}

interface GraphStoreRow {
  default_sales_channel_id?: string | null;
  default_region_id?: string | null;
}

interface GraphRegionRow {
  id: string;
  currency_code?: string | null;
}

export const defaultSellerFulfillmentDeps: SellerFulfillmentDeps = {
  async getSellerFulfillmentSnapshot(container: MedusaContainer, sellerId: string) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const [
      { data: sellers },
      { data: profiles },
      { data: stores },
      { data: regions },
    ] = await Promise.all([
      query.graph({
        entity: "seller",
        fields: ["id", "name", "stock_locations.id"],
        filters: { id: sellerId },
      }),
      query.graph({
        entity: "shipping_profile",
        fields: ["id", "name"],
      }),
      query.graph({
        entity: "store",
        fields: ["default_sales_channel_id", "default_region_id"],
      }),
      query.graph({
        entity: "region",
        fields: ["id", "currency_code"],
      }),
    ]);

    const seller = (sellers as GraphSellerRow[])[0];
    const profileRows = profiles as Array<{ id: string; name?: string }>;
    const preferredProfile =
      profileRows.find((p) => p.name === DEFAULT_SHIPPING_PROFILE_NAME) ??
      profileRows[0];
    const store = (stores as GraphStoreRow[])[0];
    const regionRows = regions as GraphRegionRow[];
    const preferredRegion =
      regionRows.find((r) => r.id === store?.default_region_id) ??
      regionRows.find((r) => r.currency_code?.toLowerCase() === "thb") ??
      regionRows[0];

    return {
      sellerName: seller?.name?.trim() || "ร้านค้า Tamadee",
      existingStockLocationId: seller?.stock_locations?.[0]?.id,
      shippingProfileId: preferredProfile?.id,
      salesChannelId: store?.default_sales_channel_id ?? undefined,
      regionId: preferredRegion?.id,
    };
  },

  async createShippingProfile(container: MedusaContainer) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: DEFAULT_SHIPPING_PROFILE_NAME, type: "default" }],
      },
    });
    return result[0].id;
  },

  async provisionWarehouseAndShipping(container, params) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    const { result: locations } = await createSellerStockLocationsWorkflow(
      container
    ).run({
      input: {
        seller_id: params.sellerId,
        locations: [
          {
            name: `คลังสินค้า ${params.sellerName}`,
            address: {
              address_1: "ประเทศไทย",
              city: "กรุงเทพมหานคร",
              country_code: "th",
            },
          },
        ],
      },
    });
    const stockLocationId = locations[0].id;

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });

    if (params.salesChannelId) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: stockLocationId, add: [params.salesChannelId] },
      });
    }

    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocationId,
        fulfillment_set_data: {
          name: `การจัดส่ง ${params.sellerName}`,
          type: "shipping",
        },
      },
    });

    const { data: locRows } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_sets.id"],
      filters: { id: stockLocationId },
    });
    const fulfillmentSetId = (
      locRows as Array<{ fulfillment_sets?: Array<{ id: string }> }>
    )[0]?.fulfillment_sets?.[0]?.id;

    if (fulfillmentSetId) {
      const { result: zones } = await createServiceZonesWorkflow(container).run({
        input: {
          data: [
            {
              fulfillment_set_id: fulfillmentSetId,
              name: `ทั่วประเทศไทย (${params.sellerName})`,
              geo_zones: [{ country_code: "th", type: "country" }],
            },
          ],
        },
      });

      const prices: Array<
        | { currency_code: string; amount: number }
        | { region_id: string; amount: number }
      > = [{ currency_code: "thb", amount: params.defaultShippingFeeThb }];
      if (params.regionId) {
        prices.push({
          region_id: params.regionId,
          amount: params.defaultShippingFeeThb,
        });
      }

      await createSellerShippingOptionsWorkflow(container).run({
        input: {
          seller_id: params.sellerId,
          shipping_options: [
            {
              name: "จัดส่งพัสดุด่วนมาตรฐาน",
              price_type: "flat",
              provider_id: "manual_manual",
              service_zone_id: zones[0].id,
              shipping_profile_id: params.shippingProfileId,
              type: {
                label: "พัสดุด่วน",
                description: "จัดส่งทั่วไทย 1-3 วันทำการ",
                code: "th-standard",
              },
              prices,
              rules: [
                { attribute: "enabled_in_store", value: "true", operator: "eq" },
                { attribute: "is_return", value: "false", operator: "eq" },
              ],
            },
          ],
        },
      });
    }

    return stockLocationId;
  },
};
