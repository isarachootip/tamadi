import { loadEnv } from "@medusajs/framework/utils";
import { assertCondition, requestJson } from "./verify-http";
import {
  verifyApprovedVendorProductCreation,
  verifySellerPendingApprovalRule,
  verifyStoreApiAndCors,
} from "./verify-vendor-and-store";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const BASE_URL = process.env.VERIFY_BACKEND_URL || "http://127.0.0.1:9000";
const ADMIN_EMAIL =
  process.env.TAMADEE_SEED_ADMIN_EMAIL || "admin@tamadee.online";
const ADMIN_PASSWORD =
  process.env.TAMADEE_SEED_ADMIN_PASSWORD || "TamadeeAdmin2026!";
const SELLER_PASSWORD =
  process.env.TAMADEE_SEED_SELLER_PASSWORD || "TamadeeSeller2026!";

async function verifyDashboards(): Promise<void> {
  const health = await fetch(`${BASE_URL}/health`);
  assertCondition(health.ok, `GET /health returned ${health.status}`);

  const adminHtmlRes = await fetch(`${BASE_URL}/dashboard/`);
  const adminHtml = await adminHtmlRes.text();
  assertCondition(
    adminHtmlRes.ok && adminHtml.includes("/dashboard/assets/"),
    "Operator Admin UI (/dashboard/) did not serve expected bundled HTML"
  );

  const vendorHtmlRes = await fetch(`${BASE_URL}/seller/`);
  const vendorHtml = await vendorHtmlRes.text();
  assertCondition(
    vendorHtmlRes.ok && vendorHtml.includes("/seller/assets/"),
    "Vendor Panel UI (/seller/) did not serve expected bundled HTML"
  );
  console.log("✔ [1/5] Health check, /dashboard/ UI, and /seller/ UI verified");
}

async function verifyAdminAndGetStoreContext(): Promise<{
  publishableKey: string;
}> {
  const auth = await requestJson<{ token: string }>(
    BASE_URL,
    "/auth/user/emailpass",
    {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    }
  );
  assertCondition(
    auth.status === 200 && Boolean(auth.data.token),
    `Admin login failed (${auth.status})`
  );
  const authHeaders = { authorization: `Bearer ${auth.data.token}` };

  const sellers = await requestJson<{
    sellers: { id: string; status: string; currency_code: string }[];
  }>(BASE_URL, "/admin/sellers", { headers: authHeaders });
  assertCondition(sellers.status === 200, "GET /admin/sellers failed");
  const openThaiSellers = sellers.data.sellers.filter(
    (s) => s.status === "open" && s.currency_code === "thb"
  );
  assertCondition(
    openThaiSellers.length >= 3,
    `Expected >= 3 open THB sellers, got ${openThaiSellers.length}`
  );

  const products = await requestJson<{ count: number }>(
    BASE_URL,
    "/admin/products?limit=50",
    { headers: authHeaders }
  );
  assertCondition(
    products.status === 200 && products.data.count >= 30,
    `Expected >= 30 products in Admin, got ${products.data.count}`
  );

  const rates = await requestJson<{
    commission_rates: { is_default: boolean; value: number }[];
  }>(BASE_URL, "/admin/commission-rates", { headers: authHeaders });
  const globalRate = rates.data.commission_rates.find((r) => r.is_default);
  assertCondition(
    globalRate?.value === 10,
    `Expected 10% default commission rate, got ${globalRate?.value}`
  );

  const keys = await requestJson<{
    api_keys: { token: string; type: string }[];
  }>(BASE_URL, "/admin/api-keys?type=publishable", { headers: authHeaders });
  const pubKey = keys.data.api_keys.find((k) => k.type === "publishable")?.token;
  assertCondition(Boolean(pubKey), "Missing publishable API key");

  console.log(
    `✔ [2/5] Admin authenticated: ${openThaiSellers.length} THB sellers, ${products.data.count} products, 10% commission`
  );
  return { publishableKey: pubKey! };
}

async function main(): Promise<void> {
  await verifyDashboards();
  const { publishableKey } = await verifyAdminAndGetStoreContext();
  await verifySellerPendingApprovalRule(
    BASE_URL,
    SELLER_PASSWORD,
    publishableKey
  );
  await verifyApprovedVendorProductCreation(BASE_URL, SELLER_PASSWORD);
  await verifyStoreApiAndCors(BASE_URL, publishableKey);
  console.log("\n🎉 Phase 1 End-to-End Verification PASSED 100%!");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
