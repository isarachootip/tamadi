import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { sharedLineExchangeStore } from "../../../../modules/line-integration/line-crypto";

const ExchangeCodeBodySchema = z.object({
  exchangeCode: z.string().trim().min(16).max(128),
});

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const parsed = ExchangeCodeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "รหัสแลกเปลี่ยนไม่ถูกต้อง" });
    return;
  }

  const consumed = sharedLineExchangeStore.consume(parsed.data.exchangeCode);
  if (!consumed) {
    res
      .status(401)
      .json({ message: "รหัสเข้าสู่ระบบหมดอายุหรือถูกใช้งานไปแล้ว กรุณาลองใหม่" });
    return;
  }

  res.status(200).json({
    token: consumed.jwtToken,
    displayName: consumed.displayName,
  });
}
