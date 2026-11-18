import { parseBackendEnv } from "../../../config/env";
import {
  extractBudgetThb,
  groundProductIds,
  matchCatalogProducts,
} from "../catalog-matcher";
import {
  generateAssistantReply,
  resolveGeminiEndpoint,
} from "../gemini-client";
import { SlidingWindowRateLimiter } from "../rate-limiter";
import type { AiCatalogItem } from "../types";

const SAMPLE_CATALOG: readonly AiCatalogItem[] = [
  {
    id: "prod_linen_shirt",
    title: "เสื้อเชิ้ตลินิน",
    handle: "linen-relaxed-shirt",
    description: "เสื้อลินินทอมือระบายอากาศดี เหมาะใส่ไปทะเลและคาเฟ่",
    thumbnail: "https://picsum.photos/seed/shirt/800/800",
    categoryNames: ["เสื้อผ้า"],
    priceAmount: 890,
    offerId: "off_shirt",
    variantId: "var_shirt",
    variantTitle: "M / ขาวครีม",
    sellerId: "sel_lamai",
    sellerName: "ลินินละไม สตูดิโอ",
  },
  {
    id: "prod_linen_shorts",
    title: "กางเกงขาสั้นลินิน",
    handle: "linen-beach-shorts",
    description: "กางเกงลินินเอวยางยืด ใส่เที่ยวทะเลสบายคล่องตัว",
    thumbnail: "https://picsum.photos/seed/shorts/800/800",
    categoryNames: ["เสื้อผ้า"],
    priceAmount: 790,
    offerId: "off_shorts",
    variantId: "var_shorts",
    variantTitle: "M / ทราย",
    sellerId: "sel_lamai",
    sellerName: "ลินินละไม สตูดิโอ",
  },
  {
    id: "prod_ceramic_mug",
    title: "แก้วเซรามิกปั้นมือ",
    handle: "handcrafted-ceramic-mug",
    description: "แก้วเซรามิกเคลือบด้าน เหมาะเป็นของขวัญขึ้นบ้านใหม่",
    thumbnail: "https://picsum.photos/seed/mug/800/800",
    categoryNames: ["ของใช้/งานคราฟต์"],
    priceAmount: 390,
    offerId: "off_mug",
    variantId: "var_mug",
    variantTitle: "มาตรฐาน",
    sellerId: "sel_baandin",
    sellerName: "บ้านดิน & ทองเหลือง",
  },
  {
    id: "prod_leather_boots",
    title: "รองเท้าบูทหนังแท้",
    handle: "handstitched-leather-boots",
    description: "รองเท้าหนังวัวแท้เย็บมือทั้งคู่",
    thumbnail: "https://picsum.photos/seed/boots/800/800",
    categoryNames: ["รองเท้า"],
    priceAmount: 3200,
    offerId: "off_boots",
    variantId: "var_boots",
    variantTitle: "42 / น้ำตาลเข้ม",
    sellerId: "sel_kaodee",
    sellerName: "ก้าวดี คราฟต์ชูส์",
  },
];

describe("Phase 5.1 AI Assistant ('Nong Tammadi') Domain & Security", () => {
  it("parses AI toggle, Gemini config, and rate limit from BackendEnv", () => {
    const defaults = parseBackendEnv({});
    expect(defaults.aiAssistantEnabled).toBe(true);
    expect(defaults.geminiApiKey).toBeUndefined();
    expect(defaults.geminiModel).toBe("gemini-2.5-flash");
    expect(defaults.aiRateLimitPerMinute).toBe(15);

    const disabled = parseBackendEnv({
      AI_ASSISTANT_ENABLED: "false",
      GEMINI_API_KEY: "test_gemini_secret",
      AI_RATE_LIMIT_PER_MINUTE: "5",
    });
    expect(disabled.aiAssistantEnabled).toBe(false);
    expect(disabled.geminiApiKey).toBe("test_gemini_secret");
    expect(disabled.aiRateLimitPerMinute).toBe(5);
  });

  it("extracts THB budget limits from natural Thai prompts", () => {
    expect(extractBudgetThb("หาชุดไปทะเล งบไม่เกิน 2,500")).toBe(2500);
    expect(extractBudgetThb("ของขวัญต่ำกว่า 500 บาท")).toBe(500);
    expect(extractBudgetThb("มีงบ 1200 พอไหม")).toBe(1200);
    expect(extractBudgetThb("แนะนำรองเท้าหนังหน่อย")).toBeNull();
  });

  it("matches real Thai beach outfit items within budget and excludes overpriced items", () => {
    const matched = matchCatalogProducts(
      "หาชุดไปทะเล งบไม่เกิน 2,500",
      SAMPLE_CATALOG
    );
    expect(matched.length).toBeGreaterThanOrEqual(2);
    const ids = matched.map((m) => m.id);
    expect(ids).toContain("prod_linen_shirt");
    expect(ids).toContain("prod_linen_shorts");
    expect(ids).not.toContain("prod_leather_boots");
  });

  it("strictly strips hallucinated product IDs and preserves database prices", () => {
    const grounded = groundProductIds(
      ["prod_FAKE_999", "prod_linen_shirt", "prod_NON_EXISTENT"],
      SAMPLE_CATALOG,
      2500
    );
    expect(grounded).toHaveLength(1);
    expect(grounded[0]?.id).toBe("prod_linen_shirt");
    expect(grounded[0]?.priceAmount).toBe(890);
    expect(grounded[0]?.offerId).toBe("off_shirt");
  });

  it("enforces per-client sliding-window rate limits", () => {
    const limiter = new SlidingWindowRateLimiter(2, 60_000);
    expect(limiter.consume("ip:1.2.3.4", 1000).allowed).toBe(true);
    expect(limiter.consume("ip:1.2.3.4", 2000).allowed).toBe(true);
    const blocked = limiter.consume("ip:1.2.3.4", 3000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(limiter.consume("ip:5.6.7.8", 3000).allowed).toBe(true);
  });

  it("grounds Gemini structured JSON response and falls back cleanly without API key", async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      reply:
                        "น้องทำมะดิจัดชุดลินินรับลมทะเลให้ 2 ชิ้น รวม ฿1,680 อยู่ในงบ ฿2,500 สบายๆ เลยครับ!",
                      productIds: [
                        "prod_linen_shirt",
                        "prod_HALLUCINATED_ID",
                        "prod_linen_shorts",
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const geminiResult = await generateAssistantReply({
      message: "หาชุดไปทะเล งบไม่เกิน 2,500",
      history: [],
      catalog: SAMPLE_CATALOG,
      geminiApiKey: "fake_key_for_unit_test",
      geminiModel: "gemini-2.5-flash",
      fetchFn: mockFetch,
    });

    expect(geminiResult.source).toBe("gemini");
    expect(geminiResult.products.map((p) => p.id)).toEqual([
      "prod_linen_shirt",
      "prod_linen_shorts",
    ]);

    const fallbackResult = await generateAssistantReply({
      message: "ของขวัญขึ้นบ้านใหม่ งบไม่เกิน 500",
      history: [],
      catalog: SAMPLE_CATALOG,
      geminiApiKey: undefined,
      geminiModel: "gemini-2.5-flash",
    });

    expect(fallbackResult.source).toBe("catalog-fallback");
    expect(fallbackResult.products[0]?.id).toBe("prod_ceramic_mug");
  });

  it("routes AQ.* Vertex AI Express keys to aiplatform.googleapis.com and AIza* keys to generativelanguage", () => {
    expect(resolveGeminiEndpoint("AQ.test_express_key", "gemini-2.5-flash")).toBe(
      "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent"
    );
    expect(resolveGeminiEndpoint("AIzaSyTestStudioKey", "gemini-2.5-flash")).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    );
  });
});
