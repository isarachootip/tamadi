"use server";

import { readCustomerToken } from "../data/cookies";
import { MercurApiError, mercurFetch } from "../data/mercur-client";
import {
  AiChatResponseSchema,
  AskAiInputSchema,
  VisualSearchInputSchema,
  VisualSearchResponseSchema,
  type AiChatResponse,
  type AiHistoryTurn,
  type VisualSearchResponse,
} from "../data/schemas/ai-schemas";

export interface AskAiActionResult {
  readonly ok: boolean;
  readonly data?: AiChatResponse;
  readonly message?: string;
}

export interface VisualSearchActionResult {
  readonly ok: boolean;
  readonly data?: VisualSearchResponse;
  readonly message?: string;
}

export async function askNongTammadiAction(input: {
  readonly message: string;
  readonly history: readonly AiHistoryTurn[];
}): Promise<AskAiActionResult> {
  const parsed = AskAiInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "ข้อความที่ส่งมาไม่ถูกต้อง",
    };
  }

  try {
    const bearerToken = await readCustomerToken();
    const response = await mercurFetch({
      method: "POST",
      path: "/store/ai/chat",
      body: {
        message: parsed.data.message,
        history: parsed.data.history,
      },
      bearerToken,
      schema: AiChatResponseSchema,
    });
    return { ok: true, data: response };
  } catch (error) {
    if (error instanceof MercurApiError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: "ไม่สามารถติดต่อผู้ช่วย AI น้องทำมะดิได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function visualSearchAction(input: {
  readonly imageBase64: string;
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
  readonly hint?: string;
}): Promise<VisualSearchActionResult> {
  const parsed = VisualSearchInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "รูปภาพที่อัปโหลดไม่ถูกต้อง",
    };
  }

  try {
    const bearerToken = await readCustomerToken();
    const response = await mercurFetch({
      method: "POST",
      path: "/store/ai/visual-search",
      body: {
        imageBase64: parsed.data.imageBase64,
        mimeType: parsed.data.mimeType,
        ...(parsed.data.hint ? { hint: parsed.data.hint } : {}),
      },
      bearerToken,
      schema: VisualSearchResponseSchema,
    });
    return { ok: true, data: response };
  } catch (error) {
    if (error instanceof MercurApiError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: "ไม่สามารถค้นหาสินค้าด้วยรูปภาพได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
