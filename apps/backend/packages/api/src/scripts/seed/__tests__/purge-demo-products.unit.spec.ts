import { TAMADEE_PRODUCTS } from "../catalog-data";
import {
  createDemoProductPurgeService,
  shouldSeedDemoCatalog,
  type DemoProductPurgeDeps,
  type DemoProductRecord,
} from "../purge-demo-products-service";

function createMockDeps(
  products: DemoProductRecord[],
  offerIdsByVariant: Record<string, string[]>
) {
  const calls: string[] = [];
  const deletedOfferIds: string[] = [];
  const deletedProductIds: string[] = [];

  const deps: DemoProductPurgeDeps = {
    async findProductsByHandles(handles) {
      calls.push("findProductsByHandles");
      const allowed = new Set(handles);
      return products.filter((p) => allowed.has(p.handle));
    },
    async findOfferIdsByVariantIds(variantIds) {
      calls.push("findOfferIdsByVariantIds");
      const found: string[] = [];
      for (const variantId of variantIds) {
        found.push(...(offerIdsByVariant[variantId] ?? []));
      }
      return found;
    },
    async deleteOffers(offerIds) {
      calls.push("deleteOffers");
      deletedOfferIds.push(...offerIds);
    },
    async deleteProducts(productIds) {
      calls.push("deleteProducts");
      deletedProductIds.push(...productIds);
    },
    logInfo: jest.fn(),
  };

  return { deps, calls, deletedOfferIds, deletedProductIds };
}

describe("Demo Product Purge Service & Seed Guard", () => {
  it("defaults shouldSeedDemoCatalog to false unless explicitly enabled", () => {
    expect(shouldSeedDemoCatalog({})).toBe(false);
    expect(shouldSeedDemoCatalog({ SEED_DEMO_CATALOG: "false" })).toBe(false);
    expect(shouldSeedDemoCatalog({ SEED_DEMO_CATALOG: "1" })).toBe(false);
    expect(shouldSeedDemoCatalog({ SEED_DEMO_CATALOG: "true" })).toBe(true);
  });

  it("deletes ONLY allowlisted demo handles and NEVER touches seller-created products", async () => {
    const mockProducts: DemoProductRecord[] = [
      {
        id: "prod_demo_1",
        handle: "linen-relaxed-shirt",
        variantIds: ["var_demo_1a", "var_demo_1b"],
      },
      {
        id: "prod_demo_2",
        handle: "white-canvas-sneaker",
        variantIds: ["var_demo_2a"],
      },
      {
        id: "prod_seller_real_1",
        handle: "prod-076bac1a-6n8yf",
        variantIds: ["var_real_1"],
      },
      {
        id: "prod_seller_real_2",
        handle: "prod-2fa46463-9ty2g",
        variantIds: ["var_real_2"],
      },
    ];

    // Even if findProductsByHandles misbehaved and returned a real seller product,
    // the service MUST double-filter against the allowlist!
    const { deps, calls, deletedOfferIds, deletedProductIds } = createMockDeps(
      mockProducts,
      {
        var_demo_1a: ["offer_1a"],
        var_demo_1b: ["offer_1b"],
        var_demo_2a: ["offer_2a"],
        var_real_1: ["offer_real_1"],
      }
    );
    const unsafeDeps: DemoProductPurgeDeps = {
      ...deps,
      async findProductsByHandles() {
        calls.push("findProductsByHandles");
        return mockProducts;
      },
    };

    const service = createDemoProductPurgeService(unsafeDeps);
    const result = await service.purgeByHandles(
      TAMADEE_PRODUCTS.map((p) => p.handle)
    );

    expect(result).toEqual({
      deletedProductCount: 2,
      deletedOfferCount: 3,
      deletedProductIds: ["prod_demo_1", "prod_demo_2"],
    });
    expect(deletedOfferIds).toEqual(["offer_1a", "offer_1b", "offer_2a"]);
    expect(deletedProductIds).toEqual(["prod_demo_1", "prod_demo_2"]);
    expect(deletedProductIds).not.toContain("prod_seller_real_1");
    expect(deletedProductIds).not.toContain("prod_seller_real_2");
    expect(calls).toEqual([
      "findProductsByHandles",
      "findOfferIdsByVariantIds",
      "deleteOffers",
      "deleteProducts",
    ]);
  });

  it("is idempotent and performs zero mutations when no demo products remain", async () => {
    const { deps, calls, deletedOfferIds, deletedProductIds } = createMockDeps(
      [
        {
          id: "prod_seller_real_1",
          handle: "prod-076bac1a-6n8yf",
          variantIds: ["var_real_1"],
        },
      ],
      {}
    );

    const service = createDemoProductPurgeService(deps);
    const result = await service.purgeByHandles(
      TAMADEE_PRODUCTS.map((p) => p.handle)
    );

    expect(result).toEqual({
      deletedProductCount: 0,
      deletedOfferCount: 0,
      deletedProductIds: [],
    });
    expect(deletedOfferIds).toHaveLength(0);
    expect(deletedProductIds).toHaveLength(0);
    expect(calls).toEqual(["findProductsByHandles"]);
  });

  it("deletes demo products cleanly even when they have no offers attached", async () => {
    const { deps, calls, deletedOfferIds, deletedProductIds } = createMockDeps(
      [
        {
          id: "prod_demo_no_offer",
          handle: "heavy-canvas-tote",
          variantIds: ["var_no_offer"],
        },
      ],
      {}
    );

    const service = createDemoProductPurgeService(deps);
    const result = await service.purgeByHandles(["heavy-canvas-tote"]);

    expect(result.deletedProductCount).toBe(1);
    expect(result.deletedOfferCount).toBe(0);
    expect(deletedOfferIds).toHaveLength(0);
    expect(deletedProductIds).toEqual(["prod_demo_no_offer"]);
    expect(calls).toEqual([
      "findProductsByHandles",
      "findOfferIdsByVariantIds",
      "deleteProducts",
    ]);
  });
});
