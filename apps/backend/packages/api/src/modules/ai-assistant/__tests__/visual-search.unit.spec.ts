import { parseBackendEnv } from "../../../config/env";
import type { AiCatalogItem } from "../types";
import {
  normalizeBase64Image,
  searchCatalogByImage,
  VisualSearchRequestSchema,
} from "../visual-search";

const VISUAL_CATALOG: readonly AiCatalogItem[] = [
  {
    id: "prod_linen_shirt",
    title: "เสื้อเชิ้ตลินิน",
    handle: "linen-relaxed-shirt",
    description: "เสื้อเชิ้ตผ้าลินินทอมือสีขาวครีม",
    categoryNames: ["เสื้อผ้า"],
    priceAmount: 890,
    offerId: "off_shirt",
    variantId: "var_shirt",
    variantTitle: "M / ขาวครีม",
    sellerId: "sel_lamai",
    sellerName: "ลินินละไม สตูดิโอ",
  },
  {
    id: "prod_leather_sandal",
    title: "รองเท้าแตะหนังแท้",
    handle: "leather-sandal",
    description: "รองเท้าหนังวัวฟอกฝาดเย็บมือ",
    categoryNames: ["รองเท้า"],
    priceAmount: 1290,
    offerId: "off_sandal",
    variantId: "var_sandal",
    variantTitle: "41 / น้ำตาล",
    sellerId: "sel_kaodee",
    sellerName: "ก้าวดี คราฟต์ชูส์",
  },
  {
    id: "prod_ceramic_vase",
    title: "แจกันเซรามิกปั้นมือ",
    handle: "ceramic-vase",
    description: "แจกันดินเผาเคลือบด้านสำหรับแต่งบ้าน",
    categoryNames: ["ของใช้/งานคราฟต์"],
    priceAmount: 650,
    offerId: "off_vase",
    variantId: "var_vase",
    variantTitle: "มาตรฐาน",
    sellerId: "sel_baandin",
    sellerName: "บ้านดิน & ทองเหลือง",
  },
];

describe("Phase 5.2 Visual Search Service & Boundary Schemas", () => {
  it("parses VISUAL_SEARCH_ENABLED toggle from BackendEnv", () => {
    expect(parseBackendEnv({}).visualSearchEnabled).toBe(true);
    expect(
      parseBackendEnv({ VISUAL_SEARCH_ENABLED: "false" }).visualSearchEnabled
    ).toBe(false);
  });

  it("validates image MIME types, strips data URI prefix, and rejects invalid formats", () => {
    const valid = VisualSearchRequestSchema.parse({
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/",
      mimeType: "image/jpeg",
      hint: "รองเท้าหนัง",
    });
    expect(normalizeBase64Image(valid.imageBase64)).toBe(
      "/9j/4AAQSkZJRgABAQAAAQABAAD/"
    );

    expect(() =>
      VisualSearchRequestSchema.parse({
        imageBase64: "abc",
        mimeType: "image/svg+xml",
      })
    ).toThrow();
  });

  it("sends inlineData to Gemini Vision, grounds real catalog IDs, and strips hallucinations", async () => {
    let capturedBody = "";
    const mockFetch: typeof fetch = async (_input, init) => {
      capturedBody = String(init?.body ?? "");
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      detectedSummary:
                        "พบรองเท้าแตะหนังวัวโทนสีน้ำตาลสไตล์มินิมอล",
                      keywords: ["รองเท้า", "หนัง", "น้ำตาล"],
                      productIds: ["prod_FAKE_SHOE_999", "prod_leather_sandal"],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const res = await searchCatalogByImage({
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/",
      mimeType: "image/jpeg",
      catalog: VISUAL_CATALOG,
      geminiApiKey: "AQ.fake_express_key",
      geminiModel: "gemini-2.5-flash",
      fetchFn: mockFetch,
    });

    expect(capturedBody).toContain('"inlineData"');
    expect(res.source).toBe("gemini-vision");
    expect(res.detectedSummary).toContain("รองเท้าแตะหนัง");
    expect(res.products).toHaveLength(1);
    expect(res.products[0]?.id).toBe("prod_leather_sandal");
    expect(res.products[0]?.priceAmount).toBe(1290);
  });

  it("falls back cleanly using hint/filename keywords when Gemini key is absent", async () => {
    const fallback = await searchCatalogByImage({
      imageBase64: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
      mimeType: "image/png",
      hint: "แจกันเซรามิก",
      catalog: VISUAL_CATALOG,
      geminiApiKey: undefined,
      geminiModel: "gemini-2.5-flash",
    });

    expect(fallback.source).toBe("catalog-fallback");
    expect(fallback.products[0]?.id).toBe("prod_ceramic_vase");
  });
});
