import type { MetadataRoute } from "next";
import {
  listCategories,
  listProducts,
  listSellers,
} from "../data/repositories/catalog-repo";
import { CANONICAL_DESKTOP_ORIGIN } from "../data/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: CANONICAL_DESKTOP_ORIGIN,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${CANONICAL_DESKTOP_ORIGIN}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${CANONICAL_DESKTOP_ORIGIN}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const [categories, products, sellers] = await Promise.all([
    listCategories().catch(() => []),
    listProducts().catch(() => []),
    listSellers().catch(() => []),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${CANONICAL_DESKTOP_ORIGIN}/products?category=${encodeURIComponent(cat.id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${CANONICAL_DESKTOP_ORIGIN}/products/${encodeURIComponent(product.id)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const sellerRoutes: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${CANONICAL_DESKTOP_ORIGIN}/sellers/${encodeURIComponent(seller.id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...sellerRoutes,
  ];
}
