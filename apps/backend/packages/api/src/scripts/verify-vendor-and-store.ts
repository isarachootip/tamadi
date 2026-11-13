import { assertCondition, requestJson } from "./verify-http";

export async function verifySellerPendingApprovalRule(
  baseUrl: string,
  sellerPassword: string,
  publishableKey: string
): Promise<void> {
  const testEmail = `pending.${Date.now()}@tamadee.online`;
  const reg = await requestJson<{ token: string }>(
    baseUrl,
    "/auth/member/emailpass/register",
    {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: sellerPassword }),
    }
  );
  assertCondition(
    reg.status === 200 && Boolean(reg.data.token),
    `Member registration failed (${reg.status})`
  );

  const createSeller = await requestJson<{
    seller: { id: string; status: string };
  }>(baseUrl, "/vendor/sellers", {
    method: "POST",
    headers: { authorization: `Bearer ${reg.data.token}` },
    body: JSON.stringify({
      name: `ร้านรออนุมัติ ${Date.now()}`,
      email: testEmail,
      member_email: testEmail,
      first_name: "ทดสอบ",
      last_name: "รออนุมัติ",
      currency_code: "thb",
    }),
  });
  assertCondition(
    createSeller.status === 201 &&
      createSeller.data.seller.status === "pending_approval",
    `Expected new seller status 'pending_approval', got '${createSeller.data.seller?.status}'`
  );

  const publicSellers = await requestJson<{ sellers: { id: string }[] }>(
    baseUrl,
    "/store/sellers",
    { headers: { "x-publishable-api-key": publishableKey } }
  );
  assertCondition(
    !publicSellers.data.sellers.some(
      (s) => s.id === createSeller.data.seller.id
    ),
    "Unapproved seller leaked into public /store/sellers!"
  );
  console.log(
    "✔ [3/5] Self-registered seller enters 'pending_approval' and is hidden from storefront"
  );
}

export async function verifyApprovedVendorProductCreation(
  baseUrl: string,
  sellerPassword: string
): Promise<void> {
  const login = await requestJson<{ token: string }>(
    baseUrl,
    "/auth/member/emailpass",
    {
      method: "POST",
      body: JSON.stringify({
        email: "lamai@tamadee.online",
        password: sellerPassword,
      }),
    }
  );
  assertCondition(login.status === 200, "Vendor login failed");
  const memberHeaders = { authorization: `Bearer ${login.data.token}` };

  const memberships = await requestJson<{
    seller_members: { seller_id: string }[];
  }>(baseUrl, "/vendor/sellers", { headers: memberHeaders });
  const sellerId = memberships.data.seller_members[0]?.seller_id;
  assertCondition(Boolean(sellerId), "Seller membership not found");

  const handle = `vendor-test-scarf-${Date.now()}`;
  const created = await requestJson<{ product: { id: string; title: string } }>(
    baseUrl,
    "/vendor/products",
    {
      method: "POST",
      headers: { ...memberHeaders, "x-seller-id": sellerId },
      body: JSON.stringify({
        title: "ผ้าพันคอลินินทอมือ (ทดสอบเพิ่มสินค้า)",
        handle,
        description: "ทดสอบการเพิ่มสินค้าผ่านระบบผู้ขาย Vendor API",
        variants: [{ title: "Free Size", sku: handle.toUpperCase() }],
      }),
    }
  );
  assertCondition(
    created.status === 201 && Boolean(created.data.product.id),
    `Vendor product creation failed (${created.status})`
  );
  console.log(
    `✔ [4/5] Approved seller logged in and created product (${created.data.product.id})`
  );
}

export async function verifyStoreApiAndCors(
  baseUrl: string,
  publishableKey: string
): Promise<void> {
  const origins = [
    "https://m.tamadee.online",
    "https://tamdi.tamadee.online",
    "https://webtamdi.tamadee.online",
  ];
  for (const origin of origins) {
    const cats = await requestJson<{
      product_categories: { name: string }[];
    }>(baseUrl, "/store/product-categories", {
      headers: { "x-publishable-api-key": publishableKey, Origin: origin },
    });
    assertCondition(cats.status === 200, "/store/product-categories failed");
    assertCondition(
      cats.headers.get("access-control-allow-origin") === origin,
      `CORS mismatch for ${origin}: got ${cats.headers.get("access-control-allow-origin")}`
    );
    assertCondition(
      cats.data.product_categories.length === 5,
      `Expected 5 categories, got ${cats.data.product_categories.length}`
    );
  }

  const regions = await requestJson<{
    regions: { id: string; currency_code: string }[];
  }>(baseUrl, "/store/regions", {
    headers: { "x-publishable-api-key": publishableKey },
  });
  const thRegion = regions.data.regions.find((r) => r.currency_code === "thb");
  assertCondition(Boolean(thRegion), "Missing THB region in /store/regions");

  const storeProducts = await requestJson<{
    products: { handle: string; title: string }[];
  }>(
    baseUrl,
    `/store/products?limit=50&region_id=${thRegion!.id}&fields=*variants.calculated_price`,
    { headers: { "x-publishable-api-key": publishableKey } }
  );
  assertCondition(
    storeProducts.status === 200 && storeProducts.data.products.length >= 30,
    `Expected >= 30 store products, got ${storeProducts.data.products.length}`
  );
  const shirt = storeProducts.data.products.find(
    (p) => p.handle === "linen-relaxed-shirt"
  );
  assertCondition(
    shirt?.title === "เสื้อเชิ้ตลินิน",
    "Hero product เสื้อเชิ้ตลินิน missing from /store/products"
  );
  console.log(
    "✔ [5/5] Store API (THB products, 5 Thai categories, sellers) & CORS verified across all 3 storefront/mobile origins"
  );
}
