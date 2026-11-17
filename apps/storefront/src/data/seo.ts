import type { Metadata } from "next";
import type { ProductDetail } from "../domain/types";

export const CANONICAL_DESKTOP_ORIGIN = "https://webtamdi.tamadee.online";

export interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly pathname: string;
  readonly imageUrl?: string | null;
}

export interface ProductJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "Product";
  readonly name: string;
  readonly description: string;
  readonly image: readonly string[];
  readonly sku?: string;
  readonly brand: {
    readonly "@type": "Brand";
    readonly name: string;
  };
  readonly offers: {
    readonly "@type": "Offer";
    readonly url: string;
    readonly priceCurrency: "THB";
    readonly price: number;
    readonly availability: string;
    readonly seller: {
      readonly "@type": "Organization";
      readonly name: string;
    };
  };
}

export function buildCanonicalUrl(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") {
    return CANONICAL_DESKTOP_ORIGIN;
  }
  return `${CANONICAL_DESKTOP_ORIGIN}${normalized.replace(/\/+$/, "")}`;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const canonical = buildCanonicalUrl(input.pathname);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: `${input.title} | Tamadee`,
      description: input.description,
      url: canonical,
      siteName: "Tamadee — ทำมาดี ทำมาขาย",
      locale: "th_TH",
      type: "website",
      ...(input.imageUrl ? { images: [{ url: input.imageUrl }] } : {}),
    },
  };
}

export function buildProductJsonLd(detail: ProductDetail): ProductJsonLd {
  const primaryOffer = detail.offers[0];
  const primaryVariant = detail.variants[0];
  const price =
    primaryOffer?.priceAmount ?? primaryVariant?.priceAmount ?? 0;
  const sellerName = primaryOffer?.sellerName ?? "ผู้สร้างสรรค์บน Tamadee";
  const inStock = primaryOffer ? primaryOffer.inStock : true;
  const images =
    detail.images.length > 0
      ? detail.images
      : detail.thumbnail
        ? [detail.thumbnail]
        : [`${CANONICAL_DESKTOP_ORIGIN}/icons/icon-512.png`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: detail.title,
    description:
      detail.description ??
      detail.subtitle ??
      `${detail.title} จากผู้สร้างสรรค์ไทยบน Tamadee`,
    image: images,
    ...(primaryVariant?.sku ? { sku: primaryVariant.sku } : {}),
    brand: {
      "@type": "Brand",
      name: sellerName,
    },
    offers: {
      "@type": "Offer",
      url: buildCanonicalUrl(`/products/${encodeURIComponent(detail.id)}`),
      priceCurrency: "THB",
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: sellerName,
      },
    },
  };
}
