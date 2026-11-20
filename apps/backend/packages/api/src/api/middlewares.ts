import { defineMiddlewares } from "@medusajs/medusa";
import { ensureVendorProductCreateDefaultsMiddleware } from "../modules/vendor-catalog/vendor-catalog-adapters";
import { ensureVendorProductUpdateThumbnailMiddleware } from "../modules/vendor-catalog/vendor-product-defaults-middleware";
import {
  ensureStoreDefaultRegionMiddleware,
  unregisteredSellersListMiddleware,
} from "../modules/vendor-onboarding/unregistered-sellers-middleware";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/sellers",
      method: ["GET"],
      middlewares: [unregisteredSellersListMiddleware],
    },
    {
      matcher: "/vendor/sellers",
      method: ["POST"],
      middlewares: [ensureStoreDefaultRegionMiddleware],
    },
    {
      matcher: "/vendor/products",
      method: ["POST"],
      middlewares: [ensureVendorProductCreateDefaultsMiddleware],
    },
    {
      matcher: "/vendor/products/:id",
      method: ["POST"],
      middlewares: [ensureVendorProductUpdateThumbnailMiddleware],
    },
    {
      matcher: "/store/ai/visual-search",
      bodyParser: { sizeLimit: "6mb" },
    },
    {
      matcher: "/webhooks/line",
      bodyParser: { preserveRawBody: true },
    },
  ],
});
