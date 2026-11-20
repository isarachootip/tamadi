import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UpdateProductMediaSchema } from "../../../../../../modules/vendor-catalog/schemas";
import { vendorCatalogService } from "../../../../../../modules/vendor-catalog/vendor-catalog-adapters";

interface AuthenticatedSellerRequest extends MedusaRequest {
  seller_context?: { seller_id?: string };
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const sellerId = (req as AuthenticatedSellerRequest).seller_context?.seller_id;
  const productId = req.params.id;

  if (!sellerId) {
    res.status(401).json({
      message: "กรุณาเข้าสู่ระบบผู้ขายและเลือกร้านค้าก่อนแก้ไขรูปภาพสินค้า",
    });
    return;
  }

  const parsed = UpdateProductMediaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "ข้อมูลรูปภาพไม่ถูกต้อง",
      issues: parsed.error.issues,
    });
    return;
  }

  try {
    const product = await vendorCatalogService.updateProductMedia(
      req.scope,
      { sellerId, productId },
      parsed.data
    );
    res.status(200).json({ product });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถบันทึกรูปภาพสินค้าได้";
    res.status(400).json({ message });
  }
}
