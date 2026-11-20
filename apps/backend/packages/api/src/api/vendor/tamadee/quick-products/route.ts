import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { QuickCreateProductSchema } from "../../../../modules/vendor-catalog/schemas";
import { vendorCatalogService } from "../../../../modules/vendor-catalog/vendor-catalog-adapters";

interface AuthenticatedSellerRequest extends MedusaRequest {
  auth_context?: { actor_id?: string };
  seller_context?: { seller_id?: string };
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const vendorReq = req as AuthenticatedSellerRequest;
  const sellerId = vendorReq.seller_context?.seller_id;
  const memberId = vendorReq.auth_context?.actor_id;

  if (!sellerId || !memberId) {
    res.status(401).json({
      message: "กรุณาเข้าสู่ระบบผู้ขายและเลือกร้านค้าก่อนสร้างสินค้า",
    });
    return;
  }

  const parsed = QuickCreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "ข้อมูลสินค้าไม่ถูกต้อง",
      issues: parsed.error.issues,
    });
    return;
  }

  try {
    const result = await vendorCatalogService.createQuickProductWithOffers(
      req.scope,
      { sellerId, memberId },
      parsed.data
    );
    res.status(201).json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถสร้างสินค้าได้";
    res.status(400).json({ message });
  }
}
