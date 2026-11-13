import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createCustomerShippingAddress,
  fetchCustomerOrderGroups,
  registerCustomerEmailPass,
} from "../src/data/repositories/auth-repo";
import {
  addOfferLineToCart,
  createMercurCart,
  transferCartOwnership,
} from "../src/data/repositories/cart-repo";
import {
  getProductDetail,
  listCategories,
  listProducts,
  listSellerProducts,
  listSellers,
} from "../src/data/repositories/catalog-repo";
import { computeCartSummary, groupCartBySeller } from "../src/domain/pricing";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const STOREFRONT_BASE = "http://127.0.0.1:3000";

async function assertHtmlContains(
  path: string,
  expectedSnippets: readonly string[]
): Promise<void> {
  const res = await fetch(`${STOREFRONT_BASE}${path}`);
  assert.equal(res.status, 200, `Expected 200 for ${path}, got ${res.status}`);
  const html = await res.text();
  for (const snippet of expectedSnippets) {
    assert.ok(
      html.includes(snippet),
      `Expected ${path} HTML to include "${snippet}"`
    );
  }
}

async function main(): Promise<void> {
  // 1. Live Mercur Catalog Repositories
  const [categories, products, sellers] = await Promise.all([
    listCategories(),
    listProducts(),
    listSellers(),
  ]);
  assert.ok(categories.length >= 5, "Expected >= 5 Thai categories");
  assert.ok(products.length >= 30, "Expected >= 30 Thai products");
  assert.ok(sellers.length >= 3, "Expected >= 3 approved Thai sellers");

  const sellerOneProducts = await listSellerProducts(sellers[0]!.id);
  const sellerTwoProducts = await listSellerProducts(sellers[1]!.id);
  assert.ok(sellerOneProducts.length > 0);
  assert.ok(sellerTwoProducts.length > 0);

  const detailOne = await getProductDetail(sellerOneProducts[0]!.id);
  const detailTwo = await getProductDetail(sellerTwoProducts[0]!.id);
  const offerOne = detailOne.offers[0]!;
  const offerTwo = detailTwo.offers[0]!;
  assert.notEqual(offerOne.sellerId, offerTwo.sellerId);

  // 2. Live Storefront SSR & PWA Manifest Verification
  await assertHtmlContains("/", [
    "ทำมาดี ทำมาขาย",
    "AI เลือกให้คุณ",
    categories[0]!.name,
    "฿",
  ]);
  await assertHtmlContains(`/products/${detailOne.id}`, [
    detailOne.title,
    offerOne.sellerName,
    "ใส่ตะกร้า",
    "ซื้อเลย",
  ]);
  await assertHtmlContains(`/sellers/${sellers[0]!.id}`, [sellers[0]!.name]);
  await assertHtmlContains("/ai", ["น้องทำมะดิ"]);

  const manifestRes = await fetch(`${STOREFRONT_BASE}/manifest.webmanifest`);
  assert.equal(manifestRes.status, 200);
  const manifestJson = (await manifestRes.json()) as {
    display?: string;
    icons?: { sizes?: string }[];
  };
  assert.equal(manifestJson.display, "standalone");
  assert.ok((manifestJson.icons?.length ?? 0) >= 3);

  // 3. 2-Seller Cart Grouping + Customer Registration + Cart Transfer
  const guestCart = await createMercurCart();
  await addOfferLineToCart({
    cartId: guestCart.id,
    offerId: offerOne.id,
    quantity: 1,
    sellerId: offerOne.sellerId,
    sellerName: offerOne.sellerName,
  });
  const twoSellerCart = await addOfferLineToCart({
    cartId: guestCart.id,
    offerId: offerTwo.id,
    quantity: 2,
    sellerId: offerTwo.sellerId,
    sellerName: offerTwo.sellerName,
  });

  const groups = groupCartBySeller(twoSellerCart.items);
  assert.equal(groups.length, 2);
  const totals = computeCartSummary(twoSellerCart);
  assert.equal(totals.totalQuantity, 3);

  const stamp = Date.now();
  const email = `web.e2e.${stamp}@tamadee.online`;
  const { token, customer } = await registerCustomerEmailPass({
    email,
    password: "TamadeeWeb!2026",
    firstName: "พิมพ์ใจ",
    lastName: "รักษ์งานคราฟต์",
    phone: "0897654321",
  });
  assert.equal(customer.email, email);

  const transferred = await transferCartOwnership({
    cartId: guestCart.id,
    bearerToken: token,
  });
  assert.equal(groupCartBySeller(transferred.items).length, 2);

  const updatedProfile = await createCustomerShippingAddress(token, {
    addressName: "คอนโด",
    firstName: "พิมพ์ใจ",
    lastName: "รักษ์งานคราฟต์",
    address1: "88/12 ถนนพระราม 4",
    city: "คลองเตย",
    province: "กรุงเทพมหานคร",
    postalCode: "10110",
    phone: "0897654321",
  });
  assert.ok(updatedProfile.addresses.length >= 1);

  const orderGroups = await fetchCustomerOrderGroups(token);
  assert.equal(orderGroups.length, 0);

  console.log(
    "✓ Live Mercur v2 + Next.js Storefront SSR + PWA + 2-Seller Cart E2E passed!"
  );
}

void main();
