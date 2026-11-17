import assert from "node:assert/strict";
import {
  buildCanonicalUrl,
  buildPageMetadata,
  buildProductJsonLd,
} from "../src/data/seo";
import { resolveSurfaceFromHostAndQuery } from "../src/domain/surface";
import type { ProductDetail } from "../src/domain/types";

export function runSurfaceAndSeoTests(): void {
  assert.equal(
    resolveSurfaceFromHostAndQuery("webtamdi.tamadee.online"),
    "desktop"
  );
  assert.equal(
    resolveSurfaceFromHostAndQuery("WEBTAMDI.tamadee.online:3000"),
    "desktop"
  );
  assert.equal(
    resolveSurfaceFromHostAndQuery("tamdi.tamadee.online"),
    "mobile"
  );
  assert.equal(resolveSurfaceFromHostAndQuery("localhost:3000"), "mobile");
  assert.equal(
    resolveSurfaceFromHostAndQuery("localhost:3000", "desktop"),
    "desktop"
  );
  assert.equal(
    resolveSurfaceFromHostAndQuery("webtamdi.tamadee.online", "mobile"),
    "mobile"
  );

  assert.equal(buildCanonicalUrl("/"), "https://webtamdi.tamadee.online");
  assert.equal(
    buildCanonicalUrl("/products/prod_01"),
    "https://webtamdi.tamadee.online/products/prod_01"
  );

  const meta = buildPageMetadata({
    title: "เสื้อเชิ้ตลินิน",
    description: "ผ้าลินินแท้ระบายอากาศดี",
    pathname: "/products/prod_01",
    imageUrl: "https://picsum.photos/seed/linen/800/800",
  });
  assert.equal(
    meta.alternates?.canonical,
    "https://webtamdi.tamadee.online/products/prod_01"
  );
  assert.equal(meta.openGraph?.locale, "th_TH");

  const sampleProduct: ProductDetail = {
    id: "prod_01",
    title: "เสื้อเชิ้ตลินิน",
    handle: "linen-shirt",
    subtitle: "ทรงหลวม",
    description: "ผ้าลินินทอมือจากเชียงใหม่",
    thumbnail: "https://picsum.photos/seed/linen/800/800",
    images: ["https://picsum.photos/seed/linen/800/800"],
    categoryNames: ["เสื้อผ้า"],
    options: [],
    variants: [
      {
        id: "var_1",
        title: "M",
        sku: "LINEN-M",
        priceAmount: 890,
        offerId: "off_1",
        optionValues: {},
      },
    ],
    offers: [
      {
        id: "off_1",
        variantId: "var_1",
        sellerId: "sel_lamai",
        sellerName: "ลินินละไม สตูดิโอ",
        sellerHandle: "lamai",
        priceAmount: 890,
        inStock: true,
      },
    ],
  };

  const jsonLd = buildProductJsonLd(sampleProduct);
  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.equal(jsonLd["@type"], "Product");
  assert.equal(jsonLd.offers.priceCurrency, "THB");
  assert.equal(jsonLd.offers.price, 890);
  assert.equal(jsonLd.offers.seller.name, "ลินินละไม สตูดิโอ");
}
