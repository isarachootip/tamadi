import type { TamadeeProductSeed } from "./types";

export function buildProductImageUrl(handle: string, index: number): string {
  return `https://picsum.photos/seed/tamadee-${handle}-${index}/800/800`;
}

export function buildSellerLogoUrl(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

export function buildSellerBannerUrl(key: string): string {
  return `https://picsum.photos/seed/tamadee-seller-${key}/1200/320`;
}

export interface CatalogAttributeValues {
  readonly sizes: string[];
  readonly colors: string[];
}

export function collectCatalogAttributeValues(
  products: readonly TamadeeProductSeed[]
): CatalogAttributeValues {
  const sizeSet = new Set<string>();
  const colorSet = new Set<string>();
  for (const product of products) {
    for (const size of product.sizes) {
      sizeSet.add(size);
    }
    colorSet.add(product.color);
  }
  return {
    sizes: Array.from(sizeSet),
    colors: Array.from(colorSet),
  };
}
