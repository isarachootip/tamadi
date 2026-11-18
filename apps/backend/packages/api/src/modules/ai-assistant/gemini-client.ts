import {
  buildFallbackReply,
  detectPromptLocale,
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
  type SupportedLocale,
} from "./types";

export interface GenerateAssistantReplyInput {
  readonly message: string;
  readonly history: readonly AiChatTurn[];
  readonly catalog: readonly AiCatalogItem[];
  readonly geminiApiKey: string | undefined;
  readonly geminiModel: string;
  readonly locale?: SupportedLocale;
  readonly fetchFn?: typeof fetch;
}

function buildSystemInstruction(
  catalog: readonly AiCatalogItem[],
  locale: SupportedLocale
): string {
  const compactCatalog = catalog.map((item) => ({
    id: item.id,
    handle: item.handle,
    title: item.title,
    priceThb: item.priceAmount,
    category: item.categoryNames.join("/"),
    seller: item.sellerName,
    desc: (item.description ?? "").slice(0, 90),
  }));

  const langRule =
    locale === "en"
      ? "Write `reply` in friendly, concise English (mentioning prices in THB ฿)."
      : locale === "zh"
        ? "Write `reply` in friendly, concise Simplified Chinese 简体中文 (mentioning prices in THB ฿)."
        : "เขียน `reply` เป็นภาษาไทยกระชับเป็นกันเอง ระบุราคาจริงเป็นเงินบาท (฿)";

  return [
    'You are "Nong Tammadi" (น้องทำมะดิ / 小Tamadee), the friendly shopping assistant for Tamadee Thai Creator Marketplace.',
    "Strict rules:",
    "1. Recommend ONLY `id` values that exist in CATALOG_JSON below. NEVER invent product IDs, names, or prices.",
    "2. Respect any THB budget limit specified by the shopper.",
    `3. ${langRule}`,
    '4. Respond strictly as JSON: {"reply": "...", "productIds": ["id1", "id2"]}',
    `CATALOG_JSON=${JSON.stringify(compactCatalog)}`,
  ].join("\n");
}

export function resolveGeminiEndpoint(apiKey: string, model: string): string {
  const encodedModel = encodeURIComponent(model);
  if (apiKey.trim().startsWith("AQ.")) {
    return `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodedModel}:generateContent`;
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent`;
}

export async function generateAssistantReply(
  input: GenerateAssistantReplyInput
): Promise<AiAssistantResult> {
  const activeLocale = input.locale ?? detectPromptLocale(input.message);
  const budgetThb = extractBudgetThb(input.message);
  const fallbackProducts = matchCatalogProducts(
    input.message,
    input.catalog,
    4
  );

  if (!input.geminiApiKey || input.catalog.length === 0) {
    return {
      reply: buildFallbackReply(
        input.message,
        fallbackProducts,
        budgetThb,
        activeLocale
      ),
      source: "catalog-fallback",
      budgetThb,
      products: fallbackProducts,
    };
  }

  const fetchImpl = input.fetchFn ?? fetch;
  const endpoint = resolveGeminiEndpoint(input.geminiApiKey, input.geminiModel);

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
          role: "system",
          parts: [{ text: buildSystemInstruction(input.catalog, activeLocale) }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
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
      reply: buildFallbackReply(
        input.message,
        fallbackProducts,
        budgetThb,
        activeLocale
      ),
      source: "catalog-fallback",
      budgetThb,
      products: fallbackProducts,
    };
  }
}
