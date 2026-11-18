import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseBackendEnv } from "../../../../config/env";
import { loadLiveStoreCatalog } from "../../../../modules/ai-assistant/catalog-loader";
import { SlidingWindowRateLimiter } from "../../../../modules/ai-assistant/rate-limiter";
import {
  searchCatalogByImage,
  VisualSearchRequestSchema,
} from "../../../../modules/ai-assistant/visual-search";

let visualLimiter: {
  limit: number;
  instance: SlidingWindowRateLimiter;
} | null = null;

function getVisualLimiter(limitPerMin: number): SlidingWindowRateLimiter {
  if (!visualLimiter || visualLimiter.limit !== limitPerMin) {
    visualLimiter = {
      limit: limitPerMin,
      instance: new SlidingWindowRateLimiter(limitPerMin, 60_000),
    };
  }
  return visualLimiter.instance;
}

function resolveClientKey(req: MedusaRequest): string {
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

  if (!env.visualSearchEnabled) {
    res.status(503).json({
      enabled: false,
      message: "ระบบค้นหาสินค้าด้วยรูปภาพปิดปรับปรุงชั่วคราว กรุณาลองใหม่ภายหลัง",
    });
    return;
  }

  const rateCheck = getVisualLimiter(env.aiRateLimitPerMinute).consume(
    resolveClientKey(req)
  );
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
    res.status(429).json({
      message: `อัปโหลดรูปถี่เกินไป กรุณารอสัก ${rateCheck.retryAfterSeconds} วินาทีแล้วลองใหม่อีกครั้งครับ`,
    });
    return;
  }

  const parsed = VisualSearchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message:
        parsed.error.issues[0]?.message ?? "ไฟล์รูปภาพที่อัปโหลดไม่ถูกต้อง",
    });
    return;
  }

  const rawKey = req.headers["x-publishable-api-key"];
  const publishableKey = typeof rawKey === "string" ? rawKey.trim() : "";
  const catalog = publishableKey
    ? await loadLiveStoreCatalog(publishableKey).catch(() => [])
    : [];

  const result = await searchCatalogByImage({
    imageBase64: parsed.data.imageBase64,
    mimeType: parsed.data.mimeType,
    hint: parsed.data.hint,
    locale: parsed.data.locale,
    catalog,
    geminiApiKey: env.geminiApiKey,
    geminiModel: env.geminiModel,
  });

  res.status(200).json({
    enabled: true,
    ...result,
  });
}
