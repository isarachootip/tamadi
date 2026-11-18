import { defineMiddlewares } from "@medusajs/medusa";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/ai/visual-search",
      bodyParser: { sizeLimit: "6mb" },
    },
  ],
});
