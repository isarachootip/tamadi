import { z } from "@medusajs/framework/zod";
import { groundProductIds, matchCatalogProducts } from "./catalog-matcher";
import { resolveGeminiEndpoint } from "./gemini-client";
import {
  GeminiApiEnvelopeSchema,
  SupportedLocaleSchema,
  type AiCatalogItem,
  type SupportedLocale,
} from "./types";

const MAX_BASE64_CHARS = 5_500_000;

export const AllowedVisualMimeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const VisualSearchRequestSchema = z.object({
  imageBase64: z
    .string()
    .trim()
    .min(16, "รูปภาพที่อัปโหลดว่างเปล่าหรือไม่สมบูรณ์")
    .max(MAX_BASE64_CHARS, "ไฟล์รูปภาพมีขนาดใหญ่เกิน 4 MB กรุณาเลือกรูปที่เล็กลง"),
  mimeType: AllowedVisualMimeSchema,
  hint: z.string().trim().max(160).optional(),
  locale: SupportedLocaleSchema.optional(),
});

const GeminiVisionReplySchema = z.object({
  detectedSummary: z.string().trim().min(1),
  keywords: z.array(z.string().trim().min(1)).max(8).default([]),
  productIds: z.array(z.string().trim().min(1)).max(6).default([]),
});

export type AllowedVisualMime = z.infer<typeof AllowedVisualMimeSchema>;

export interface VisualSearchResult {
  readonly detectedSummary: string;
  readonly keywords: readonly string[];
  readonly source: "gemini-vision" | "catalog-fallback";
  readonly products: readonly AiCatalogItem[];
}

export interface SearchCatalogByImageInput {
  readonly imageBase64: string;
  readonly mimeType: AllowedVisualMime;
  readonly hint?: string;
  readonly locale?: SupportedLocale;
  readonly catalog: readonly AiCatalogItem[];
  readonly geminiApiKey: string | undefined;
  readonly geminiModel: string;
  readonly fetchFn?: typeof fetch;
}

export function normalizeBase64Image(raw: string): string {
  const trimmed = raw.trim();
  const commaIdx = trimmed.indexOf(",");
  if (trimmed.startsWith("data:") && commaIdx !== -1) {
    return trimmed.slice(commaIdx + 1).replace(/\s+/g, "");
  }
  return trimmed.replace(/\s+/g, "");
}

function buildVisionPrompt(
  catalog: readonly AiCatalogItem[],
  hint?: string,
  locale: SupportedLocale = "th"
): string {
  const compact = catalog.map((item) => ({
    id: item.id,
    handle: item.handle,
    title: item.title,
    category: item.categoryNames.join("/"),
    priceThb: item.priceAmount,
  }));

  const summaryLang =
    locale === "en"
      ? "1 concise English sentence"
      : locale === "zh"
        ? "1 concise Simplified Chinese sentence (简体中文)"
        : "ภาษาไทย 1 ประโยค";

  return [
    "You are the Visual Search matcher for Tamadee Thai Creator Marketplace.",
    "Analyze the uploaded photo and pick up to 4 closest real `id` values from CATALOG_JSON.",
    hint ? `Shopper hint: "${hint}"` : "",
    `Return JSON strictly: {"detectedSummary":"(${summaryLang})","keywords":["k1","k2"],"productIds":["id1","id2"]}`,
    `CATALOG_JSON=${JSON.stringify(compact)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function searchCatalogByImage(
  input: SearchCatalogByImageInput
): Promise<VisualSearchResult> {
  const hintQuery = (input.hint ?? "").trim() || "เสื้อผ้า รองเท้า กระเป๋า คราฟต์";
  const fallbackProducts = matchCatalogProducts(hintQuery, input.catalog, 4);

  if (!input.geminiApiKey || input.catalog.length === 0) {
    return {
      detectedSummary: input.hint
        ? `ค้นหาสินค้าที่คล้ายกับ "${input.hint}" จากแคตตาล็อกจริงของ Tamadee`
        : "คัดสรรสินค้ายอดนิยมจากสตูดิโอผู้สร้างสรรค์ไทยที่ใกล้เคียงกับภาพของคุณ",
      keywords: input.hint ? [input.hint] : ["งานคราฟต์ไทย", "ทำมาดี"],
      source: "catalog-fallback",
      products: fallbackProducts,
    };
  }

  const fetchImpl = input.fetchFn ?? fetch;
  const endpoint = resolveGeminiEndpoint(input.geminiApiKey, input.geminiModel);
  const cleanBase64 = normalizeBase64Image(input.imageBase64);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: input.mimeType,
                  data: cleanBase64,
                },
              },
              { text: buildVisionPrompt(input.catalog, input.hint, input.locale) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision HTTP ${response.status}`);
    }

    const envelope = GeminiApiEnvelopeSchema.parse(await response.json());
    const rawText =
      envelope.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const parsed = GeminiVisionReplySchema.parse(JSON.parse(rawText));

    const grounded = groundProductIds(parsed.productIds, input.catalog, null);
    const keywordMatched =
      grounded.length > 0
        ? grounded
        : matchCatalogProducts(parsed.keywords.join(" "), input.catalog, 4);

    return {
      detectedSummary: parsed.detectedSummary,
      keywords: parsed.keywords,
      source: "gemini-vision",
      products: keywordMatched.length > 0 ? keywordMatched : fallbackProducts,
    };
  } catch {
    return {
      detectedSummary: input.hint
        ? `ค้นหาสินค้าที่คล้ายกับ "${input.hint}" จากแคตตาล็อกจริงของ Tamadee`
        : "คัดสรรสินค้าสไตล์ใกล้เคียงจากสตูดิโอผู้สร้างสรรค์ไทยบน Tamadee",
      keywords: input.hint ? [input.hint] : ["แฟชั่นไทย", "งานทำมือ"],
      source: "catalog-fallback",
      products: fallbackProducts,
    };
  }
}
