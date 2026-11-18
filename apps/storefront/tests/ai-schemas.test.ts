import assert from "node:assert/strict";
import {
  AiChatResponseSchema,
  AskAiInputSchema,
} from "../src/data/schemas/ai-schemas";

export function runAiSchemaTests(): void {
  const validInput = AskAiInputSchema.parse({
    message: "  หาชุดไปทะเล งบไม่เกิน 2,500  ",
    history: [{ role: "user", content: "สวัสดี" }],
  });
  assert.equal(validInput.message, "หาชุดไปทะเล งบไม่เกิน 2,500");

  assert.throws(() => AskAiInputSchema.parse({ message: "   ", history: [] }));

  const parsedResponse = AiChatResponseSchema.parse({
    enabled: true,
    reply: "จัดชุดลินินให้ 2 ชิ้นครับ!",
    source: "gemini",
    budgetThb: 2500,
    products: [
      {
        id: "prod_01",
        title: "เสื้อเชิ้ตลินิน",
        handle: "linen-shirt",
        priceAmount: 890,
        offerId: "off_01",
        variantId: "var_01",
        variantTitle: "M / ขาวครีม",
        sellerId: "sel_lamai",
        sellerName: "ลินินละไม สตูดิโอ",
        categoryNames: ["เสื้อผ้า"],
      },
    ],
  });

  assert.equal(parsedResponse.products.length, 1);
  assert.equal(parsedResponse.products[0]?.offerId, "off_01");
}
