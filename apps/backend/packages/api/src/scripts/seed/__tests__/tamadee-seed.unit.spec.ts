import { parseBackendEnv } from "../../../config/env";
import {
  TAMADEE_CATEGORIES,
  TAMADEE_PRODUCTS,
  TAMADEE_SELLERS,
} from "../catalog-data";
import {
  buildProductImageUrl,
  collectCatalogAttributeValues,
} from "../catalog-helpers";

describe("Tamadee Backend Config & Catalog Invariants", () => {
  it("parses default development environment with all 4 Tamadee domains in CORS", () => {
    const env = parseBackendEnv({});
    expect(env.workerMode).toBe("shared");
    expect(env.disableDashboards).toBe(false);
    expect(env.s3).toBeNull();
    expect(env.storeCors).toContain("https://m.tamadee.online");
    expect(env.storeCors).toContain("https://tamdi.tamadee.online");
    expect(env.storeCors).toContain("https://webtamdi.tamadee.online");
    expect(env.adminCors).toContain("https://bwebtamdi.tamadee.online");
    expect(env.vendorCors).toContain("https://bwebtamdi.tamadee.online");
  });

  it("disables admin and vendor UI automatically in worker mode", () => {
    const env = parseBackendEnv({ MEDUSA_WORKER_MODE: "worker" });
    expect(env.workerMode).toBe("worker");
    expect(env.disableDashboards).toBe(true);
  });

  it("validates Cloudflare R2 S3 credentials when S3_BUCKET is provided", () => {
    expect(() =>
      parseBackendEnv({ S3_BUCKET: "tamadee-media" })
    ).toThrow();

    const env = parseBackendEnv({
      S3_BUCKET: "tamadee-media",
      S3_FILE_URL: "https://media.tamadee.online",
      S3_ACCESS_KEY_ID: "r2_key_id",
      S3_SECRET_ACCESS_KEY: "r2_secret_key",
      S3_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    });
    expect(env.s3).toEqual({
      bucket: "tamadee-media",
      fileUrl: "https://media.tamadee.online",
      accessKeyId: "r2_key_id",
      secretAccessKey: "r2_secret_key",
      region: "auto",
      endpoint: "https://account.r2.cloudflarestorage.com",
    });
  });

  it("defines 5 Thai categories, 3 Thai sellers, and 30 unique Thai THB products", () => {
    expect(TAMADEE_CATEGORIES.map((c) => c.name)).toEqual([
      "เสื้อผ้า",
      "รองเท้า",
      "กระเป๋า",
      "เครื่องประดับ",
      "ของใช้/งานคราฟต์",
    ]);
    expect(TAMADEE_SELLERS).toHaveLength(3);
    expect(TAMADEE_PRODUCTS).toHaveLength(30);

    const handles = new Set(TAMADEE_PRODUCTS.map((p) => p.handle));
    expect(handles.size).toBe(30);

    const linenShirt = TAMADEE_PRODUCTS.find(
      (p) => p.handle === "linen-relaxed-shirt"
    );
    const canvasSneaker = TAMADEE_PRODUCTS.find(
      (p) => p.handle === "white-canvas-sneaker"
    );
    expect(linenShirt?.title).toBe("เสื้อเชิ้ตลินิน");
    expect(linenShirt?.priceThb).toBe(890);
    expect(canvasSneaker?.title).toBe("รองเท้าผ้าใบสีขาว");
    expect(canvasSneaker?.priceThb).toBe(1590);
  });

  it("extracts distinct sizes/colors and builds deterministic product image URLs", () => {
    const attrs = collectCatalogAttributeValues(TAMADEE_PRODUCTS);
    expect(attrs.sizes).toContain("M");
    expect(attrs.sizes).toContain("41");
    expect(attrs.sizes).toContain("Free Size");
    expect(attrs.colors).toContain("ขาวครีม");
    expect(buildProductImageUrl("linen-relaxed-shirt", 1)).toBe(
      "https://picsum.photos/seed/tamadee-linen-relaxed-shirt-1/800/800"
    );
  });
});
