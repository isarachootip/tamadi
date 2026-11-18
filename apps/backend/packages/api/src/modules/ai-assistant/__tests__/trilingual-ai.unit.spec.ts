import {
  buildFallbackReply,
  detectPromptLocale,
  extractBudgetThb,
  matchCatalogProducts,
} from "../catalog-matcher";
import { generateAssistantReply } from "../gemini-client";
import type { AiCatalogItem } from "../types";

const TRILINGUAL_SAMPLE: readonly AiCatalogItem[] = [
  {
    id: "prod_linen_shirt",
    title: "เสื้อเชิ้ตลินิน",
    handle: "linen-relaxed-shirt",
    description: "เสื้อเชิ้ตผ้าลินินทอมือระบายอากาศดี เหมาะใส่ไปทะเล",
    categoryNames: ["เสื้อผ้า"],
    priceAmount: 890,
    offerId: "off_shirt",
    variantId: "var_shirt",
    variantTitle: "M / ขาวครีม",
    sellerId: "sel_lamai",
    sellerName: "ลินินละไม สตูดิโอ",
  },
  {
    id: "prod_ceramic_mug",
    title: "แก้วเซรามิกปั้นมือ",
    handle: "stoneware-drip-mug",
    description: "แก้วเซรามิกเคลือบด้าน เหมาะเป็นของขวัญ",
    categoryNames: ["ของใช้/งานคราฟต์"],
    priceAmount: 490,
    offerId: "off_mug",
    variantId: "var_mug",
    variantTitle: "มาตรฐาน",
    sellerId: "sel_baandin",
    sellerName: "บ้านดิน & ทองเหลือง",
  },
];

describe("Trilingual AI Assistant (TH / EN / ZH)", () => {
  it("extracts THB budgets from Thai, English, and Chinese queries", () => {
    expect(extractBudgetThb("หาชุดไปทะเล งบไม่เกิน 2,500")).toBe(2500);
    expect(extractBudgetThb("linen shirt under 1,200 thb")).toBe(1200);
    expect(extractBudgetThb("海边亚麻衣服 预算2500以内")).toBe(2500);
    expect(extractBudgetThb("礼物不超过600泰铢")).toBe(600);
  });

  it("auto-detects Chinese and English prompts when locale is omitted", () => {
    expect(detectPromptLocale("อยากได้เสื้อลินิน")).toBe("th");
    expect(detectPromptLocale("Looking for a handmade ceramic mug")).toBe("en");
    expect(detectPromptLocale("推荐一个手工陶瓷杯子")).toBe("zh");
  });

  it("matches Thai catalog items from English and Chinese keywords", async () => {
    const enMatches = matchCatalogProducts(
      "beach linen shirt under 1500",
      TRILINGUAL_SAMPLE
    );
    expect(enMatches[0]?.id).toBe("prod_linen_shirt");

    const zhMatches = matchCatalogProducts(
      "手工陶瓷杯礼物 不超过600",
      TRILINGUAL_SAMPLE
    );
    expect(zhMatches[0]?.id).toBe("prod_ceramic_mug");

    const enReply = buildFallbackReply(
      "linen shirt",
      enMatches,
      1500,
      "en"
    );
    expect(enReply).toContain("THB");

    const zhResult = await generateAssistantReply({
      message: "推荐手工陶瓷礼物 不超过600",
      history: [],
      catalog: TRILINGUAL_SAMPLE,
      geminiApiKey: undefined,
      geminiModel: "gemini-2.5-flash",
      locale: "zh",
    });
    expect(zhResult.reply).toContain("฿");
    expect(zhResult.products[0]?.id).toBe("prod_ceramic_mug");
  });
});
