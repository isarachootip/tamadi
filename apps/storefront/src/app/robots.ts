import type { MetadataRoute } from "next";
import { CANONICAL_DESKTOP_ORIGIN } from "../data/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/account"],
      },
    ],
    sitemap: `${CANONICAL_DESKTOP_ORIGIN}/sitemap.xml`,
    host: CANONICAL_DESKTOP_ORIGIN,
  };
}
