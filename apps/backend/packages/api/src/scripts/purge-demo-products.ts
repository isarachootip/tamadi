import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";
import { deleteOffersWorkflow } from "@mercurjs/core/workflows";
import { TAMADEE_PRODUCTS } from "./seed/catalog-data";
import {
  createDemoProductPurgeService,
  type DemoProductRecord,
} from "./seed/purge-demo-products-service";

interface RawProductRow {
  readonly id: string;
  readonly handle: string;
  readonly variants?: ReadonlyArray<{ readonly id: string }>;
}

interface RawOfferRow {
  readonly id: string;
}

export default async function purgeTamadeeDemoProducts({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const service = createDemoProductPurgeService({
    async findProductsByHandles(handles): Promise<DemoProductRecord[]> {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "variants.id"],
        filters: { handle: [...handles] },
      });
      return (data as RawProductRow[]).map((row) => ({
        id: row.id,
        handle: row.handle,
        variantIds: (row.variants ?? []).map((variant) => variant.id),
      }));
    },

    async findOfferIdsByVariantIds(variantIds): Promise<string[]> {
      const { data } = await query.graph({
        entity: "offer",
        fields: ["id"],
        filters: { variant_id: [...variantIds] },
      });
      return (data as RawOfferRow[]).map((offer) => offer.id);
    },

    async deleteOffers(offerIds): Promise<void> {
      await deleteOffersWorkflow(container).run({
        input: { ids: [...offerIds] },
      });
    },

    async deleteProducts(productIds): Promise<void> {
      await deleteProductsWorkflow(container).run({
        input: { ids: [...productIds] },
      });
    },

    logInfo(message) {
      logger.info(message);
    },
  });

  const demoHandles = TAMADEE_PRODUCTS.map((product) => product.handle);
  await service.purgeByHandles(demoHandles);
}
