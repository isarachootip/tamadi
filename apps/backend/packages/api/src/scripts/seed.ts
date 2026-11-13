import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { seedAdminAndSellers } from "./seed/admin-and-sellers";
import { seedProductsAndOffers } from "./seed/products-and-offers";
import { seedStoreAndRegion } from "./seed/store-region";

export default async function seedTamadeeMarketplace({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("=== เริ่มจำลองข้อมูลเริ่มต้น Tamadee (ทำมาดี ทำมาขาย) ===");
  const storeCtx = await seedStoreAndRegion(container);
  const sellersByKey = await seedAdminAndSellers(container, storeCtx);
  const catalogStats = await seedProductsAndOffers(container, sellersByKey);

  logger.info(
    [
      "=== จำลองข้อมูล Tamadee สำเร็จเรียบร้อย ===",
      `  • Region ID (THB / VAT 7% Inclusive): ${storeCtx.regionId}`,
      `  • Publishable API Key: ${storeCtx.publishableApiKeyToken}`,
      `  • ร้านค้าไทยที่อนุมัติแล้ว: ${sellersByKey.size} ร้าน`,
      `  • สินค้าภาษาไทย: ${catalogStats.productCount} รายการ (${catalogStats.offerCount} ข้อเสนอ THB)`,
    ].join("\n")
  );
}
