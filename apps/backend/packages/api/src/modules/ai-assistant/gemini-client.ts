import {
  buildFallbackThaiReply,
  extractBudgetThb,
  groundProductIds,
  matchCatalogProducts,
} from "./catalog-matcher";
import {
  GeminiApiEnvelopeSchema,
  GeminiStructuredReplySchema,
  type AiAssistantResult,
  type AiCatalogItem,
  type AiChatTurn,
} from "./types";

export interface GenerateAssistantReplyInput {
  readonly message: string;
  readonly history: readonly AiChatTurn[];
  readonly catalog: readonly AiCatalogItem[];
  readonly geminiApiKey: string | undefined;
  readonly geminiModel: string;
  readonly fetchFn?: typeof fetch;
}

function buildSystemInstruction(catalog: readonly AiCatalogItem[]): string {
  const compactCatalog = catalog.map((item) => ({
    id: item.id,
    title: item.title,
    priceThb: item.priceAmount,
    category: item.categoryNames.join("/"),
    seller: item.sellerName,
    desc: (item.description ?? "").slice(0, 90),
  }));

  return [
    'คุณคือ "น้องทำมะดิ" ผู้ช่วยช้อปปิ้งอารมณ์ดีของตลาดออนไลน์ไทย Tamadee ("ทำมาดี ทำมาขาย")',
    "กฎเหล็กที่ห้ามละเมิดเด็ดขาด:",
    "1. เลือกแนะนำเฉพาะรหัสสินค้า `id` ที่มีอยู่ในรายการ CATALOG_JSON ด้านล่างเท่านั้น ห้ามแต่งชื่อสินค้า รหัสสินค้า หรือราคาขึ้นมาเองเด็ดขาด",
    "2. หากลูกค้ากำหนดงบประมาณ (เช่น งบไม่เกิน 2,500) ให้เลือกสินค้าที่ราคาแต่ละชิ้นไม่เกินงบ และถ้าระบุคำว่า 'ชุด' พยายามจัดคู่ที่ราคารวมอยู่ในงบ",
    "3. ตอบกลับเป็น JSON เท่านั้น ตามโครงสร้าง: {\"reply\": \"ข้อความภาษาไทยกระชับเป็นกันเอง ระบุราคาจริงจากแคตตาล็อก\", \"productIds\": [\"id1\", \"id2\"]}",
    `CATALOG_JSON=${JSON.stringify(compactCatalog)}`,
  ].join("\n");
}

export async function generateAssistantReply(
  input: GenerateAssistantReplyInput
): Promise<AiAssistantResult> {
  const budgetThb = extractBudgetThb(input.message);
  const fallbackProducts = matchCatalogProducts(
    input.message,
    input.catalog,
    4
  );

  if (!input.geminiApiKey || input.catalog.length === 0) {
    return {
      reply: buildFallbackThaiReply(input.message, fallbackProducts, budgetThb),
      source: "catalog-fallback",
      budgetThb,
      products: fallbackProducts,
    };
  }

  const fetchImpl = input.fetchFn ?? fetch;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.geminiModel)}:generateContent`;

  const contents = [
    ...input.history.slice(-6).map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: input.message }] },
  ];

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction(input.catalog) }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const rawEnvelope: unknown = await response.json();
    const envelope = GeminiApiEnvelopeSchema.parse(rawEnvelope);
    const rawText =
      envelope.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const parsedJson: unknown = JSON.parse(rawText);
    const structured = GeminiStructuredReplySchema.parse(parsedJson);

    const grounded = groundProductIds(
      structured.productIds,
      input.catalog,
      budgetThb
    );
    const finalProducts = grounded.length > 0 ? grounded : fallbackProducts;

    return {
      reply: structured.reply,
      source: "gemini",
      budgetThb,
      products: finalProducts,
    };
  } catch {
    return {
      reply: buildFallbackThaiReply(input.message, fallbackProducts, budgetThb),
      source: "catalog-fallback",
      budgetThb,
      products: fallbackProducts,
    };
  }
}
