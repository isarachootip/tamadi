import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ProductStatus } from "@mercurjs/types";
import {
  applyVendorProductDefaults,
  createVendorProductCreateMiddleware,
  ensureVendorProductUpdateThumbnailMiddleware,
} from "../vendor-product-defaults-middleware";

function createMockNext(): jest.Mock & MedusaNextFunction {
  return jest.fn() as unknown as jest.Mock & MedusaNextFunction;
}

describe("applyVendorProductDefaults", () => {
  it("falls back to first image URL when thumbnail is missing or blank", () => {
    const body: Record<string, unknown> = {
      title: "หน่อไม้ส้ม",
      images: [
        { url: "https://bwebtamdi.tamadee.online/static/1-bamboo.jpg" },
        { url: "https://bwebtamdi.tamadee.online/static/2-bamboo.jpg" },
      ],
    };

    applyVendorProductDefaults(body, {
      defaultPublished: true,
      productRequestEnabled: false,
    });

    expect(body.thumbnail).toBe(
      "https://bwebtamdi.tamadee.online/static/1-bamboo.jpg"
    );
    expect(body.status).toBe(ProductStatus.PUBLISHED);
  });

  it("preserves explicit thumbnail and explicit draft status", () => {
    const body: Record<string, unknown> = {
      title: "หน่อไม้ส้ม",
      thumbnail: "https://bwebtamdi.tamadee.online/static/cover.jpg",
      images: [{ url: "https://bwebtamdi.tamadee.online/static/other.jpg" }],
      status: ProductStatus.DRAFT,
    };

    applyVendorProductDefaults(body, {
      defaultPublished: true,
      productRequestEnabled: false,
    });

    expect(body.thumbnail).toBe(
      "https://bwebtamdi.tamadee.online/static/cover.jpg"
    );
    expect(body.status).toBe(ProductStatus.DRAFT);
  });

  it("does not force published status when product_request feature flag is enabled", () => {
    const body: Record<string, unknown> = {
      title: "หน่อไม้ส้ม",
      images: [{ url: "https://bwebtamdi.tamadee.online/static/1.jpg" }],
    };

    applyVendorProductDefaults(body, {
      defaultPublished: true,
      productRequestEnabled: true,
    });

    expect(body.thumbnail).toBe(
      "https://bwebtamdi.tamadee.online/static/1.jpg"
    );
    expect(body.status).toBeUndefined();
  });
});

describe("Vendor product defaults middlewares", () => {
  it("auto-approves pending_approval seller and normalizes create payload", async () => {
    const approveSeller = jest.fn(async () => undefined);
    const middleware = createVendorProductCreateMiddleware({
      getSellerStatus: jest.fn(async () => "pending_approval"),
      approveSeller,
      isProductRequestEnabled: () => false,
    });

    const req = {
      scope: {},
      seller_context: { seller_id: "sel_new" },
      body: {
        title: "หน่อไม้ส้ม",
        images: [{ url: "https://bwebtamdi.tamadee.online/static/a.jpg" }],
      },
    } as unknown as MedusaRequest;
    const next = createMockNext();

    await middleware(req, {} as MedusaResponse, next);

    expect(approveSeller).toHaveBeenCalledWith(expect.anything(), "sel_new");
    expect((req.body as Record<string, unknown>).thumbnail).toBe(
      "https://bwebtamdi.tamadee.online/static/a.jpg"
    );
    expect((req.body as Record<string, unknown>).status).toBe(
      ProductStatus.PUBLISHED
    );
    expect(next).toHaveBeenCalledWith();
  });

  it("does not auto-approve suspended sellers", async () => {
    const approveSeller = jest.fn(async () => undefined);
    const middleware = createVendorProductCreateMiddleware({
      getSellerStatus: jest.fn(async () => "suspended"),
      approveSeller,
      isProductRequestEnabled: () => false,
    });

    const req = {
      scope: {},
      seller_context: { seller_id: "sel_suspended" },
      body: { title: "สินค้า" },
    } as unknown as MedusaRequest;
    const next = createMockNext();

    await middleware(req, {} as MedusaResponse, next);

    expect(approveSeller).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("sets thumbnail from first image on product update when thumbnail is omitted", () => {
    const req = {
      body: {
        images: [{ url: "https://bwebtamdi.tamadee.online/static/edit.jpg" }],
      },
    } as unknown as MedusaRequest;
    const next = createMockNext();

    ensureVendorProductUpdateThumbnailMiddleware(req, {} as MedusaResponse, next);

    expect((req.body as Record<string, unknown>).thumbnail).toBe(
      "https://bwebtamdi.tamadee.online/static/edit.jpg"
    );
    expect(next).toHaveBeenCalledWith();
  });
});
