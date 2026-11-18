import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { parseBackendEnv } from "../../../config/env";
import { verifyLineWebhookSignature } from "../../../modules/line-integration/line-crypto";
import { sendLinePushNotification } from "../../../modules/line-integration/line-messaging";

const LineWebhookBodySchema = z.object({
  events: z
    .array(
      z.object({
        type: z.string(),
        source: z
          .object({
            userId: z.string().optional(),
          })
          .optional(),
      })
    )
    .default([]),
});

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const env = parseBackendEnv(process.env);
  if (!env.lineMessagingChannelSecret) {
    res.status(503).json({ message: "LINE webhook not configured" });
    return;
  }

  const rawSig = req.headers["x-line-signature"];
  const sigHeader = typeof rawSig === "string" ? rawSig : undefined;
  const rawBody =
    req.rawBody instanceof Buffer
      ? req.rawBody
      : Buffer.from(JSON.stringify(req.body ?? {}), "utf8");

  if (
    !verifyLineWebhookSignature(rawBody, sigHeader, env.lineMessagingChannelSecret)
  ) {
    res.status(401).json({ message: "Invalid x-line-signature" });
    return;
  }

  const parsed = LineWebhookBodySchema.safeParse(req.body);
  if (parsed.success && env.lineNotificationsEnabled && env.lineMessagingAccessToken) {
    for (const ev of parsed.data.events) {
      if (ev.type === "follow" && ev.source?.userId) {
        await sendLinePushNotification({
          channelAccessToken: env.lineMessagingAccessToken,
          lineUserId: ev.source.userId,
          text: "สวัสดีครับ! น้องทำมะดิยินดีที่ได้เป็นเพื่อนกันครับ 🎉 เมื่อคุณเข้าสู่ระบบด้วย LINE บนเว็บหรือแอป Tamadee ระบบจะแจ้งเตือนสถานะคำสั่งซื้อและเลขพัสดุให้ทางห้องแชตนี้ทันที!",
        }).catch(() => false);
      }
    }
  }

  res.status(200).json({ ok: true });
}
