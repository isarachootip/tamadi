import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createPricePreferencesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  updatePricePreferencesWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ensurePublishableKeyAndCommission } from "./commission-and-keys";
import type { StoreRegionSeedResult } from "./types";

const updateStoreCurrencies = createWorkflow(
  "tamadee-update-store-currencies",
  (input: { storeId: string }) => {
    const normalized = transform({ input }, (data) => ({
      selector: { id: data.input.storeId },
      update: {
        supported_currencies: [{ currency_code: "thb", is_default: true }],
      },
    }));
    return new WorkflowResponse(updateStoresStep(normalized));
  }
);

export async function seedStoreAndRegion(
  container: MedusaContainer
): Promise<StoreRegionSeedResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const storeModule = container.resolve(Modules.STORE);
  const regionModule = container.resolve(Modules.REGION);
  const taxModule = container.resolve(Modules.TAX);

  logger.info("[Tamadee Seed] Configuring Store (THB) & Sales Channel...");
  const [store] = await storeModule.listStores();
  let channels = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!channels.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    });
    channels = result;
  }
  const defaultSalesChannelId = channels[0].id;

  await updateStoreCurrencies(container).run({ input: { storeId: store.id } });
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Tamadee (ทำมาดี ทำมาขาย)",
        default_sales_channel_id: defaultSalesChannelId,
      },
    },
  });

  logger.info("[Tamadee Seed] Configuring Thailand Region & 7% VAT Inclusive...");
  const existingRegions = await regionModule.listRegions(
    {},
    { relations: ["countries"] }
  );
  let thRegion = existingRegions.find((r) =>
    r.countries?.some((c) => c.iso_2 === "th")
  );
  if (!thRegion) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "ประเทศไทย",
            currency_code: "thb",
            countries: ["th"],
            automatic_taxes: true,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    thRegion = result[0];
  }

  let [thTaxRegion] = await taxModule.listTaxRegions({ country_code: "th" });
  if (!thTaxRegion) {
    const { result } = await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "th", provider_id: "tp_system" }],
    });
    thTaxRegion = result[0];
  }

  const existingRates = await taxModule.listTaxRates({
    tax_region_id: thTaxRegion.id,
  });
  if (!existingRates.some((r) => r.code === "TH-VAT7")) {
    await createTaxRatesWorkflow(container).run({
      input: [
        {
          tax_region_id: thTaxRegion.id,
          name: "VAT 7%",
          code: "TH-VAT7",
          rate: 7,
          is_default: true,
        },
      ],
    });
  }

  const { data: prefs } = await query.graph({
    entity: "price_preference",
    fields: ["id", "attribute", "value", "is_tax_inclusive"],
  });
  for (const target of [
    { attribute: "currency_code", value: "thb" },
    { attribute: "region_id", value: thRegion.id },
  ]) {
    const existing = (
      prefs as {
        id: string;
        attribute: string;
        value: string;
        is_tax_inclusive: boolean;
      }[]
    ).find((p) => p.attribute === target.attribute && p.value === target.value);
    if (!existing) {
      await createPricePreferencesWorkflow(container).run({
        input: [{ ...target, is_tax_inclusive: true }],
      });
    } else if (!existing.is_tax_inclusive) {
      await updatePricePreferencesWorkflow(container).run({
        input: {
          selector: { id: [existing.id] },
          update: { is_tax_inclusive: true },
        },
      });
    }
  }

  const apiKey = await ensurePublishableKeyAndCommission(
    container,
    defaultSalesChannelId
  );

  return {
    storeId: store.id,
    defaultSalesChannelId,
    regionId: thRegion.id,
    publishableApiKeyId: apiKey.id,
    publishableApiKeyToken: apiKey.token,
  };
}
