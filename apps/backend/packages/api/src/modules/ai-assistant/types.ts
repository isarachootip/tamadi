import { z } from "@medusajs/framework/zod";

export const SupportedLocaleSchema = z.enum(["th", "en", "zh"]);
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;

export const AiChatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

export const AiChatRequestSchema = z.object({
  message: z.string().trim().min(1, "กรุณาพิมพ์ข้อความที่ต้องการถาม").max(400),
  history: z.array(AiChatTurnSchema).max(8).default([]),
  locale: SupportedLocaleSchema.optional(),
});

export const GeminiStructuredReplySchema = z.object({
  reply: z.string().trim().min(1),
  productIds: z.array(z.string().min(1)).max(6).default([]),
});

export const GeminiApiEnvelopeSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z
              .array(z.object({ text: z.string().optional() }))
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

export type AiChatTurn = z.infer<typeof AiChatTurnSchema>;
export type AiChatRequest = z.infer<typeof AiChatRequestSchema>;

export interface AiCatalogItem {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly description?: string;
  readonly thumbnail?: string;
  readonly categoryNames: readonly string[];
  readonly priceAmount: number;
  readonly offerId: string;
  readonly variantId: string;
  readonly variantTitle: string;
  readonly sellerId: string;
  readonly sellerName: string;
}

export interface AiAssistantResult {
  readonly reply: string;
  readonly source: "gemini" | "catalog-fallback";
  readonly budgetThb: number | null;
  readonly products: readonly AiCatalogItem[];
}
