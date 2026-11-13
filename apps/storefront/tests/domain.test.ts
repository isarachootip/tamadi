import assert from "node:assert/strict";
import {
  computeCartSummary,
  estimateSellerShipping,
  formatThb,
  groupCartBySeller,
} from "../src/domain/pricing";
import {
  buildGalleryUrls,
  filterAndSortProducts,
  findMatchingVariant,
  findOfferForVariant,
} from "../src/domain/catalog-logic";
import type { CartModel, ProductDetail, ProductSummary } from "../src/domain/types";

export function runDomainTests(): void {
  // 1. THB formatting
  assert.equal(formatThb(0), "฿0");
  assert.equal(formatThb(890), "฿890");
  assert.equal(formatThb(1590), "฿1,590");
  assert.equal(formatThb(12500.4), "฿12,500");

  // 2. Seller shipping & cart grouping
  assert.equal(estimateSellerShipping(1200), 40);
  assert.equal(estimateSellerShipping(3000), 0);

  const sampleCart: CartModel = {
    id: "cart_01",
    currencyCode: "thb",
    regionId: "reg_th",
    itemSubtotal: 0,
    shippingTotal: 0,
    discountTotal: 100,
    total: 0,
    promoCodes: ["TAMADEE100"],
    items: [
      {
        id: "li_1",
        productId: "prod_1",
        variantId: "var_1",
        offerId: "off_1",
        title: "เสื้อลินินทรงหลวม",
        quantity: 2,
        unitPrice: 890,
        sellerId: "sel_lamai",
        sellerName: "ละไม สตูดิโอ",
      },
      {
        id: "li_2",
        productId: "prod_2",
        variantId: "var_2",
        offerId: "off_2",
        title: "แก้วเซรามิกปั้นมือ",
        quantity: 1,
        unitPrice: 450,
        sellerId: "sel_baandin",
        sellerName: "บ้านดิน คราฟต์",
      },
    ],
  };

  const groups = groupCartBySeller(sampleCart.items);
  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.sellerId, "sel_lamai");
  assert.equal(groups[0]?.subtotal, 1780);
  assert.equal(groups[0]?.shippingEstimate, 40);
  assert.equal(groups[1]?.sellerId, "sel_baandin");
  assert.equal(groups[1]?.subtotal, 450);

  const totals = computeCartSummary(sampleCart);
  assert.equal(totals.totalQuantity, 3);
  assert.equal(totals.itemSubtotal, 2230);
  assert.equal(totals.shippingTotal, 80);
  assert.equal(totals.discountTotal, 100);
  assert.equal(totals.grandTotal, 2210);

  // 3. Variant & Offer matching + Gallery deduplication
  const sampleDetail: ProductDetail = {
    id: "prod_linen",
    title: "เสื้อลินินคอจีน",
    handle: "linen-shirt",
    thumbnail: "https://picsum.photos/seed/a/800/800",
    images: [
      "https://picsum.photos/seed/a/800/800",
      "https://picsum.photos/seed/b/800/800",
    ],
    categoryNames: ["เสื้อผ้า"],
    options: [
      { id: "opt_size", title: "ไซซ์", values: ["M", "L"] },
      { id: "opt_color", title: "สี", values: ["ขาวดิบ"] },
    ],
    variants: [
      {
        id: "var_m",
        title: "M / ขาวดิบ",
        priceAmount: 890,
        optionValues: { opt_size: "M", opt_color: "ขาวดิบ" },
      },
      {
        id: "var_l",
        title: "L / ขาวดิบ",
        priceAmount: 950,
        optionValues: { opt_size: "L", opt_color: "ขาวดิบ" },
      },
    ],
    offers: [
      {
        id: "off_m",
        variantId: "var_m",
        sellerId: "sel_1",
        sellerName: "ละไม สตูดิโอ",
        sellerHandle: "lamai",
        priceAmount: 890,
        inStock: true,
      },
      {
        id: "off_l",
        variantId: "var_l",
        sellerId: "sel_1",
        sellerName: "ละไม สตูดิโอ",
        sellerHandle: "lamai",
        priceAmount: 950,
        inStock: true,
      },
    ],
  };

  assert.deepEqual(buildGalleryUrls(sampleDetail), [
    "https://picsum.photos/seed/a/800/800",
    "https://picsum.photos/seed/b/800/800",
  ]);
  const matchedVariant = findMatchingVariant(sampleDetail, {
    opt_size: "L",
    opt_color: "ขาวดิบ",
  });
  assert.equal(matchedVariant?.id, "var_l");
  assert.equal(findOfferForVariant(sampleDetail, matchedVariant?.id)?.id, "off_l");

  // 4. Filter & sort products
  const products: ProductSummary[] = [
    {
      id: "p1",
      title: "กระเป๋าผ้าแคนวาส",
      handle: "bag",
      priceAmount: 1290,
      categoryIds: ["c_bag"],
      categoryNames: ["กระเป๋า"],
    },
    {
      id: "p2",
      title: "ต่างหูเงินแท้",
      handle: "earring",
      priceAmount: 590,
      categoryIds: ["c_acc"],
      categoryNames: ["เครื่องประดับ"],
    },
  ];
  const sortedAsc = filterAndSortProducts(products, {
    minPrice: 500,
    maxPrice: 1300,
    sort: "price_asc",
  });
  assert.deepEqual(
    sortedAsc.map((p) => p.id),
    ["p2", "p1"]
  );
}
