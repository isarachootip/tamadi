import { defineMiddlewares } from "@medusajs/medusa";
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
      matcher: "/store/ai/visual-search",
      bodyParser: { sizeLimit: "6mb" },
    },
    {
      matcher: "/webhooks/line",
      bodyParser: { preserveRawBody: true },
    },
  ],
});
