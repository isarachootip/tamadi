import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createCommissionRatesWorkflow,
  updateCommissionRatesWorkflow,
} from "@mercurjs/core/workflows";
import { CommissionRateType, MercurModules } from "@mercurjs/types";

export interface PublishableKeyResult {
  readonly id: string;
  readonly token: string;
}

export async function ensurePublishableKeyAndCommission(
  container: MedusaContainer,
  defaultSalesChannelId: string
): Promise<PublishableKeyResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("[Tamadee Seed] Configuring Publishable API Key & 10% Commission...");
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: { type: "publishable" },
  });
  let apiKey = (keys as { id: string; token: string }[])[0];
  if (!apiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Tamadee Storefront & Mobile",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    apiKey = { id: result[0].id, token: result[0].token };
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [defaultSalesChannelId] },
    });
  } catch (err: unknown) {
    if (!(err instanceof Error && err.message.includes("already"))) {
      throw err;
    }
  }

  const commissionService = container.resolve(MercurModules.COMMISSION) as {
    listCommissionRates: (filters: {
      is_default?: boolean;
    }) => Promise<{ id: string }[]>;
  };
  const [globalRate] = await commissionService.listCommissionRates({
    is_default: true,
  });
  if (globalRate) {
    await updateCommissionRatesWorkflow(container).run({
      input: [
        {
          id: globalRate.id,
          value: 10,
          include_shipping: false,
          is_enabled: true,
        },
      ],
    });
  } else {
    await createCommissionRatesWorkflow(container).run({
      input: [
        {
          name: "Global Marketplace Commission",
          code: "tamadee-default-10",
          type: CommissionRateType.PERCENTAGE,
          value: 10,
          include_shipping: false,
          is_enabled: true,
          is_default: true,
        },
      ],
    });
  }

  return apiKey;
}
