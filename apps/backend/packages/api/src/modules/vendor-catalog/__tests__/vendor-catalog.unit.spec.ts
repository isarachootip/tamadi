import { ProductStatus } from "@mercurjs/types";
import {
  buildVariantSku,
  CreateVendorCategorySchema,
  QuickCreateProductSchema,
  resolveProductPublishStatus,
  slugifyHandle,
} from "../schemas";
import {
  createEnsureSellerFulfillmentReady,
  type SellerFulfillmentDeps,
} from "../seller-fulfillment-provisioner";
import {
  createVendorCatalogService,
  type VendorCatalogDeps,
} from "../vendor-catalog-service";

describe("Vendor Catalog Schemas & Pure Helpers", () => {
  it("validates Thai category creation payload and trims whitespace", () => {
    const parsed = CreateVendorCategorySchema.safeParse({
      name: "  อาหารโฮมเมด  ",
      description: "เมนูปรุงสดจากครัวคุณแหม่ม",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("อาหารโฮมเมด");
    }
  });

  it("rejects category with empty name", () => {
    const parsed = CreateVendorCategorySchema.safeParse({ name: "   " });
    expect(parsed.success).toBe(false);
  });

  it("validates quick product with variants, THB price, and stock", () => {
    const parsed = QuickCreateProductSchema.safeParse({
      title: "น้ำพริกเผากุ้งแห้งสูตรโบราณ",
      description: "ไม่ใส่วัตถุกันเสีย",
      category_id: "pcat_food",
      publish_immediately: true,
      variants: [
        { title: "กระปุกเล็ก 150g", price_thb: 120, stock_quantity: 25 },
        { title: "กระปุกใหญ่ 300g", price_thb: 220, stock_quantity: 15 },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects quick product with zero price or empty variants", () => {
    expect(
      QuickCreateProductSchema.safeParse({
        title: "เมนูทดสอบ",
        variants: [],
      }).success
    ).toBe(false);

    expect(
      QuickCreateProductSchema.safeParse({
        title: "เมนูทดสอบ",
        variants: [{ title: "ธรรมดา", price_thb: 0, stock_quantity: 5 }],
      }).success
    ).toBe(false);
  });

  it("generates URL-safe ASCII handles for both English and Thai titles", () => {
    expect(slugifyHandle("Homemade Chili Paste", "cat")).toBe(
      "homemade-chili-paste"
    );
    const thaiSlug = slugifyHandle("อาหารโฮมเมด ซอย 8", "cat");
    expect(thaiSlug).toMatch(/^[a-z0-9-]+$/);
    expect(thaiSlug.startsWith("cat-")).toBe(true);
    expect(slugifyHandle("อาหารโฮมเมด ซอย 8", "cat")).toBe(thaiSlug);
  });

  it("generates clean ASCII SKUs for Thai product variants", () => {
    const sku = buildVariantSku("sel_01ABCD99", "น้ำพริกเผา", "กระปุกเล็ก", 0);
    expect(sku).toMatch(/^[A-Z0-9-]+$/);
    expect(sku.length).toBeLessThanOrEqual(48);
  });

  it("gates product publish status based on seller approval status", () => {
    expect(resolveProductPublishStatus("open", true)).toBe(
      ProductStatus.PUBLISHED
    );
    expect(resolveProductPublishStatus("open", false)).toBe(
      ProductStatus.DRAFT
    );
    expect(resolveProductPublishStatus("pending_approval", true)).toBe(
      ProductStatus.PROPOSED
    );
    expect(resolveProductPublishStatus("suspended", true)).toBe(
      ProductStatus.PROPOSED
    );
  });
});

describe("ensureSellerFulfillmentReady", () => {
  function createMockDeps(
    overrides: Partial<SellerFulfillmentDeps> = {}
  ): SellerFulfillmentDeps {
    return {
      getSellerFulfillmentSnapshot: jest.fn(async () => ({
        sellerName: "ครัวคุณแหม่มซอย8",
        existingStockLocationId: undefined,
        shippingProfileId: "sp_default",
        salesChannelId: "sc_default",
        regionId: "reg_th",
      })),
      createShippingProfile: jest.fn(async () => "sp_created"),
      provisionWarehouseAndShipping: jest.fn(async () => "sloc_new"),
      ...overrides,
    };
  }

  it("reuses existing seller stock location without reprovisioning", async () => {
    const deps = createMockDeps({
      getSellerFulfillmentSnapshot: jest.fn(async () => ({
        sellerName: "ครัวคุณแหม่มซอย8",
        existingStockLocationId: "sloc_existing",
        shippingProfileId: "sp_default",
        salesChannelId: "sc_default",
        regionId: "reg_th",
      })),
    });

    const ensureReady = createEnsureSellerFulfillmentReady(deps);
    const result = await ensureReady({} as never, "sel_1");

    expect(result).toEqual({
      stockLocationId: "sloc_existing",
      shippingProfileId: "sp_default",
      provisioned: false,
    });
    expect(deps.provisionWarehouseAndShipping).not.toHaveBeenCalled();
  });

  it("provisions default Thailand warehouse and shipping option when missing", async () => {
    const deps = createMockDeps();
    const ensureReady = createEnsureSellerFulfillmentReady(deps);

    const result = await ensureReady({} as never, "sel_2");

    expect(result).toEqual({
      stockLocationId: "sloc_new",
      shippingProfileId: "sp_default",
      provisioned: true,
    });
    expect(deps.provisionWarehouseAndShipping).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        sellerId: "sel_2",
        sellerName: "ครัวคุณแหม่มซอย8",
        shippingProfileId: "sp_default",
        salesChannelId: "sc_default",
        regionId: "reg_th",
        defaultShippingFeeThb: 45,
      })
    );
  });
});

describe("VendorCatalogService", () => {
  function createMockCatalogDeps(
    overrides: Partial<VendorCatalogDeps> = {}
  ): VendorCatalogDeps {
    return {
      findCategoryHandles: jest.fn(async () => []),
      createCategory: jest.fn(async (_scope, input) => ({
        id: "pcat_1",
        name: input.name,
        handle: input.handle,
        description: input.description ?? "",
        is_active: true,
      })),
      getSellerStatus: jest.fn(async () => "open"),
      ensureFulfillmentReady: jest.fn(async () => ({
        stockLocationId: "sloc_1",
        shippingProfileId: "sp_1",
        provisioned: true,
      })),
      createProductWithVariants: jest.fn(async () => ({
        id: "prod_1",
        title: "ข้าวผัดปู",
        handle: "prod-1",
        status: ProductStatus.PUBLISHED,
        variants: [
          { id: "var_1", title: "ธรรมดา", sku: "SKU-1" },
          { id: "var_2", title: "พิเศษ", sku: "SKU-2" },
        ],
      })),
      createOffers: jest.fn(async (_scope, offers) =>
        offers.map((offer, idx) => ({
          id: `off_${idx + 1}`,
          variant_id: offer.variant_id,
          sku: offer.sku,
        }))
      ),
      ...overrides,
    };
  }

  it("appends suffix when category handle already exists", async () => {
    const deps = createMockCatalogDeps({
      findCategoryHandles: jest.fn(async () => ["snacks"]),
    });
    const service = createVendorCatalogService(deps);

    const category = await service.createVendorCategory({} as never, {
      name: "Snacks",
      handle: "snacks",
    });

    expect(category.handle).toBe("snacks-2");
    expect(deps.createCategory).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ handle: "snacks-2", is_active: true })
    );
  });

  it("creates seller-scoped product and THB offers with stock in one flow", async () => {
    const deps = createMockCatalogDeps();
    const service = createVendorCatalogService(deps);

    const result = await service.createQuickProductWithOffers(
      {} as never,
      { sellerId: "sel_mom", memberId: "mem_1" },
      {
        title: "ข้าวผัดปู",
        category_id: "pcat_1",
        publish_immediately: true,
        variants: [
          { title: "ธรรมดา", price_thb: 89, stock_quantity: 20 },
          { title: "พิเศษ", price_thb: 129, stock_quantity: 10 },
        ],
      }
    );

    expect(deps.ensureFulfillmentReady).toHaveBeenCalledWith(
      expect.anything(),
      "sel_mom"
    );
    expect(deps.createProductWithVariants).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        sellerId: "sel_mom",
        status: ProductStatus.PUBLISHED,
        categoryId: "pcat_1",
      })
    );
    expect(deps.createOffers).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          seller_id: "sel_mom",
          created_by: "mem_1",
          variant_id: "var_1",
          shipping_profile_id: "sp_1",
          prices: [{ amount: 89, currency_code: "thb" }],
          inventory_items: [
            expect.objectContaining({
              stock_levels: [{ location_id: "sloc_1", stocked_quantity: 20 }],
            }),
          ],
        }),
      ])
    );
    expect(result.offers).toHaveLength(2);
    expect(result.provisioned_fulfillment).toBe(true);
  });
});
