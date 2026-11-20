import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { CreateVendorCategorySchema } from "../../../../modules/vendor-catalog/schemas";
import { vendorCatalogService } from "../../../../modules/vendor-catalog/vendor-catalog-adapters";

interface VendorRequestWithSeller extends MedusaRequest {
  seller_context?: { seller_id?: string };
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: product_categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "description", "is_active", "parent_category_id"],
    filters: { is_active: true },
  });

  res.status(200).json({
    product_categories,
    count: product_categories.length,
  });
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const sellerId = (req as VendorRequestWithSeller).seller_context?.seller_id;
  if (!sellerId) {
    res.status(401).json({
      message: "กรุณาเข้าสู่ระบบผู้ขายและเลือกร้านค้าก่อนสร้างหมวดหมู่สินค้า",
    });
    return;
  }

  const parsed = CreateVendorCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "ข้อมูลหมวดหมู่สินค้าไม่ถูกต้อง",
      issues: parsed.error.issues,
    });
    return;
  }

  try {
    const product_category = await vendorCatalogService.createVendorCategory(
      req.scope,
      parsed.data
    );
    res.status(201).json({ product_category });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถสร้างหมวดหมู่สินค้าได้";
    res.status(400).json({ message });
  }
}
