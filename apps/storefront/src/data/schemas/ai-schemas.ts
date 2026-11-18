import { z } from "zod";

export const AiHistoryTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

export const AskAiInputSchema = z.object({
  message: z.string().trim().min(1, "กรุณาพิมพ์คำถามที่ต้องการให้ช่วยหา").max(400),
  history: z.array(AiHistoryTurnSchema).max(8).default([]),
});

export const AiRecommendedProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  categoryNames: z.array(z.string()).default([]),
  priceAmount: z.number().nonnegative(),
  offerId: z.string().min(1),
  variantId: z.string().min(1),
  variantTitle: z.string().default("มาตรฐาน"),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
});

export const AiChatResponseSchema = z.object({
  enabled: z.boolean().default(true),
  reply: z.string().min(1),
  source: z.enum(["gemini", "catalog-fallback"]),
  budgetThb: z.number().nullable(),
  products: z.array(AiRecommendedProductSchema).default([]),
});

export const VisualSearchInputSchema = z.object({
  imageBase64: z.string().trim().min(16, "กรุณาเลือกรูปภาพสินค้าที่ต้องการค้นหา"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  hint: z.string().trim().max(160).optional(),
});

export const VisualSearchResponseSchema = z.object({
  enabled: z.boolean().default(true),
  detectedSummary: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  source: z.enum(["gemini-vision", "catalog-fallback"]),
  products: z.array(AiRecommendedProductSchema).default([]),
});

export type AiHistoryTurn = z.infer<typeof AiHistoryTurnSchema>;
export type AiRecommendedProduct = z.infer<typeof AiRecommendedProductSchema>;
export type AiChatResponse = z.infer<typeof AiChatResponseSchema>;
export type VisualSearchResponse = z.infer<typeof VisualSearchResponseSchema>;
