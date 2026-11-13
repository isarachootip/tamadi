import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createShippingProfilesWorkflow } from "@medusajs/medusa/core-flows";
import {
  approveSellerWorkflow,
  createSellerAccountWorkflow,
} from "@mercurjs/core/workflows";
import { ensureEmailPassIdentity, ensureOperatorAdmin } from "./admin-user";
import { TAMADEE_SELLERS } from "./catalog-data";
import { buildSellerBannerUrl, buildSellerLogoUrl } from "./catalog-helpers";
import { provisionSellerWarehouseAndShipping } from "./seller-fulfillment";
import type {
  SeededSellerRef,
  StoreRegionSeedResult,
  TamadeeSellerSeed,
} from "./types";

export async function seedAdminAndSellers(
  container: MedusaContainer,
  ctx: StoreRegionSeedResult
): Promise<Map<TamadeeSellerSeed["key"], SeededSellerRef>> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  await ensureOperatorAdmin(container);

  const sellerPassword =
    process.env.TAMADEE_SEED_SELLER_PASSWORD || "TamadeeSeller2026!";

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    filters: { name: "Marketplace Shipping" },
  });
  let shippingProfileId = (profiles as { id: string }[])[0]?.id;
  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Marketplace Shipping", type: "default" }] },
    });
    shippingProfileId = result[0].id;
  }

  const sellersByKey = new Map<TamadeeSellerSeed["key"], SeededSellerRef>();

  for (const [index, cfg] of TAMADEE_SELLERS.entries()) {
    const { data: found } = await query.graph({
      entity: "seller",
      fields: ["id", "stock_locations.id"],
      filters: { email: cfg.email },
    });
    const existing = (
      found as { id: string; stock_locations?: { id: string }[] }[]
    )[0];

    if (existing?.stock_locations?.[0]) {
      const { data: members } = await query.graph({
        entity: "member",
        fields: ["id"],
        filters: { email: cfg.email },
      });
      sellersByKey.set(cfg.key, {
        key: cfg.key,
        id: existing.id,
        name: cfg.name,
        memberId: (members as { id: string }[])[0].id,
        stockLocationId: existing.stock_locations[0].id,
        shippingProfileId,
      });
      continue;
    }

    logger.info(`[Tamadee Seed] Creating Thai seller "${cfg.name}"...`);
    const authIdentityId = await ensureEmailPassIdentity(
      container,
      cfg.email,
      sellerPassword
    );
    const { result: seller } = await createSellerAccountWorkflow(
      container
    ).run({
      input: {
        auth_identity_id: authIdentityId,
        member_email: cfg.email,
        first_name: cfg.firstName,
        last_name: cfg.lastName,
        seller: {
          name: cfg.name,
          email: cfg.email,
          currency_code: "thb",
          description: cfg.description,
          logo: buildSellerLogoUrl(cfg.name),
          banner: buildSellerBannerUrl(cfg.key),
        },
      },
    });
    await approveSellerWorkflow(container).run({
      input: { seller_id: seller.id },
    });

    const { data: members } = await query.graph({
      entity: "member",
      fields: ["id"],
      filters: { email: cfg.email },
    });
    const memberId = (members as { id: string }[])[0].id;

    const stockLocationId = await provisionSellerWarehouseAndShipping(
      container,
      {
        sellerId: seller.id,
        cfg,
        ctx,
        shippingProfileId,
        isDefaultStoreLocation: index === 0,
      }
    );

    sellersByKey.set(cfg.key, {
      key: cfg.key,
      id: seller.id,
      name: cfg.name,
      memberId,
      stockLocationId,
      shippingProfileId,
    });
  }

  return sellersByKey;
}
