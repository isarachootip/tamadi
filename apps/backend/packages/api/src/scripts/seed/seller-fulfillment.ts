import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createSellerShippingOptionsWorkflow,
  createSellerStockLocationsWorkflow,
} from "@mercurjs/core/workflows";
import type { StoreRegionSeedResult, TamadeeSellerSeed } from "./types";

export async function provisionSellerWarehouseAndShipping(
  container: MedusaContainer,
  params: {
    sellerId: string;
    cfg: TamadeeSellerSeed;
    ctx: StoreRegionSeedResult;
    shippingProfileId: string;
    isDefaultStoreLocation: boolean;
  }
): Promise<string> {
  const { sellerId, cfg, ctx, shippingProfileId, isDefaultStoreLocation } =
    params;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  const { result: locations } = await createSellerStockLocationsWorkflow(
    container
  ).run({
    input: {
      seller_id: sellerId,
      locations: [
        {
          name: `คลังสินค้า ${cfg.name}`,
          address: {
            city: cfg.city,
            province: cfg.province,
            postal_code: cfg.postalCode,
            country_code: "th",
            address_1: cfg.address1,
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
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocationId, add: [ctx.defaultSalesChannelId] },
  });

  if (isDefaultStoreLocation) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: ctx.storeId },
        update: { default_location_id: stockLocationId },
      },
    });
  }

  await createLocationFulfillmentSetWorkflow(container).run({
    input: {
      location_id: stockLocationId,
      fulfillment_set_data: {
        name: `การจัดส่ง ${cfg.name}`,
        type: "shipping",
      },
    },
  });

  const { data: locWithSet } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id"],
    filters: { id: stockLocationId },
  });
  const fulfillmentSetId = (
    locWithSet as { fulfillment_sets?: { id: string }[] }[]
  )[0]?.fulfillment_sets?.[0]?.id;
  if (!fulfillmentSetId) {
    throw new Error(`Missing fulfillment set for seller ${cfg.name}`);
  }

  const { result: zones } = await createServiceZonesWorkflow(container).run({
    input: {
      data: [
        {
          fulfillment_set_id: fulfillmentSetId,
          name: `ทั่วประเทศไทย (${cfg.name})`,
          geo_zones: [{ country_code: "th", type: "country" }],
        },
      ],
    },
  });

  await createSellerShippingOptionsWorkflow(container).run({
    input: {
      seller_id: sellerId,
      shipping_options: [
        {
          name: "จัดส่งพัสดุด่วนมาตรฐาน",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: zones[0].id,
          shipping_profile_id: shippingProfileId,
          type: {
            label: "พัสดุด่วน",
            description: "จัดส่งทั่วไทย 1-3 วันทำการ",
            code: "th-standard",
          },
          prices: [
            { currency_code: "thb", amount: cfg.shippingFlatFeeThb },
            { region_id: ctx.regionId, amount: cfg.shippingFlatFeeThb },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    },
  });

  return stockLocationId;
}
