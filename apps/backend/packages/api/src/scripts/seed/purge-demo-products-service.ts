export interface DemoProductRecord {
  readonly id: string;
  readonly handle: string;
  readonly variantIds: readonly string[];
}

export interface DemoProductPurgeDeps {
  readonly findProductsByHandles: (
    handles: readonly string[]
  ) => Promise<DemoProductRecord[]>;
  readonly findOfferIdsByVariantIds: (
    variantIds: readonly string[]
  ) => Promise<string[]>;
  readonly deleteOffers: (offerIds: readonly string[]) => Promise<void>;
  readonly deleteProducts: (productIds: readonly string[]) => Promise<void>;
  readonly logInfo?: (message: string) => void;
}

export interface DemoProductPurgeResult {
  readonly deletedProductCount: number;
  readonly deletedOfferCount: number;
  readonly deletedProductIds: readonly string[];
}

export function shouldSeedDemoCatalog(
  env: Readonly<Record<string, string | undefined>> = process.env
): boolean {
  return env.SEED_DEMO_CATALOG === "true";
}

export function createDemoProductPurgeService(deps: DemoProductPurgeDeps) {
  return {
    async purgeByHandles(
      demoHandles: readonly string[]
    ): Promise<DemoProductPurgeResult> {
      const uniqueHandles = Array.from(
        new Set(demoHandles.map((h) => h.trim()).filter(Boolean))
      );
      if (uniqueHandles.length === 0) {
        return {
          deletedProductCount: 0,
          deletedOfferCount: 0,
          deletedProductIds: [],
        };
      }

      const allowlist = new Set(uniqueHandles);
      const candidates = await deps.findProductsByHandles(uniqueHandles);
      const safeTargets = candidates.filter((product) =>
        allowlist.has(product.handle)
      );

      if (safeTargets.length === 0) {
        deps.logInfo?.("[Tamadee Purge] No demo products found; nothing to delete.");
        return {
          deletedProductCount: 0,
          deletedOfferCount: 0,
          deletedProductIds: [],
        };
      }

      const variantIds = Array.from(
        new Set(safeTargets.flatMap((product) => product.variantIds))
      );
      const offerIds =
        variantIds.length > 0
          ? Array.from(new Set(await deps.findOfferIdsByVariantIds(variantIds)))
          : [];

      if (offerIds.length > 0) {
        await deps.deleteOffers(offerIds);
      }

      const productIds = safeTargets.map((product) => product.id);
      await deps.deleteProducts(productIds);

      deps.logInfo?.(
        `[Tamadee Purge] Removed ${productIds.length} demo product(s) and ${offerIds.length} demo offer(s).`
      );

      return {
        deletedProductCount: productIds.length,
        deletedOfferCount: offerIds.length,
        deletedProductIds: productIds,
      };
    },
  };
}
