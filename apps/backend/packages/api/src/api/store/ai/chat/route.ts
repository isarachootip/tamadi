import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseBackendEnv } from "../../../../config/env";
import { loadLiveStoreCatalog } from "../../../../modules/ai-assistant/catalog-loader";
import { generateAssistantReply } from "../../../../modules/ai-assistant/gemini-client";
import { SlidingWindowRateLimiter } from "../../../../modules/ai-assistant/rate-limiter";
import { AiChatRequestSchema } from "../../../../modules/ai-assistant/types";

let sharedLimiter: { limit: number; instance: SlidingWindowRateLimiter } | null =
  null;

function getRateLimiter(limitPerMin: number): SlidingWindowRateLimiter {
  if (!sharedLimiter || sharedLimiter.limit !== limitPerMin) {
    sharedLimiter = {
      limit: limitPerMin,
      instance: new SlidingWindowRateLimiter(limitPerMin, 60_000),
    };
  }
  return sharedLimiter.instance;
}

function resolveClientKey(req: MedusaRequest): string {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.length > 16) {
    return `auth:${authHeader.slice(-24)}`;
  }
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return `ip:${forwarded.split(",")[0]!.trim()}`;
  }
  return `ip:${req.socket?.remoteAddress ?? "unknown"}`;
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const env = parseBackendEnv(process.env);

  if (!env.aiAssistantEnabled) {
    res.status(503).json({
      enabled: false,
      message: "ขณะนี้ผู้ช่วย AI น้องทำมะดิปิดปรับปรุงชั่วคราว กรุณาลองใหม่ภายหลัง",
    });
    return;
  }

  const rateCheck = getRateLimiter(env.aiRateLimitPerMinute).consume(
    resolveClientKey(req)
  );
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      message: `คุณส่งคำถามถี่เกินไป กรุณารอสัก ${rateCheck.retryAfterSeconds} วินาทีแล้วถามน้องทำมะดิใหม่อีกครั้งครับ`,
    });
    return;
  }

  const parsedBody = AiChatRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({
      message:
        parsedBody.error.issues[0]?.message ??
        "รูปแบบข้อความที่ส่งมาไม่ถูกต้อง",
    });
    return;
  }

  const rawKey = req.headers["x-publishable-api-key"];
  const publishableKey = typeof rawKey === "string" ? rawKey.trim() : "";

  const catalog = publishableKey
    ? await loadLiveStoreCatalog(publishableKey).catch(() => [])
    : [];

  const result = await generateAssistantReply({
    message: parsedBody.data.message,
    history: parsedBody.data.history,
    catalog,
    geminiApiKey: env.geminiApiKey,
    geminiModel: env.geminiModel,
  });

  res.status(200).json({
    enabled: true,
    ...result,
  });
}
