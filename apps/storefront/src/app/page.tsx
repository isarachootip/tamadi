import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { CategoryPillsRow } from "../components/home/CategoryPillsRow";
import { HomeHeader } from "../components/home/HomeHeader";
import { HomeHeroBanner } from "../components/home/HomeHeroBanner";
import { ProductCard } from "../components/shared/ProductCard";
import { MobileAppShell } from "../components/shell/MobileAppShell";
import { listCategories, listProducts } from "../data/repositories/catalog-repo";
import { getServerCart } from "../data/session";
import { computeCartSummary } from "../domain/pricing";

export default async function HomePage(): Promise<JSX.Element> {
  const [categories, products, cart] = await Promise.all([
    listCategories().catch(() => []),
    listProducts().catch(() => []),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);
  const aiPicks = products.slice(0, 4);
  const newArrivals = products.slice(4, 14);

  return (
    <MobileAppShell>
      <HomeHeader cartCount={cartSummary.totalQuantity} />

      <div className="space-y-6 px-4 pt-4">
        <HomeHeroBanner />

        <section aria-labelledby="categories-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 id="categories-heading" className="text-base font-extrabold">
              หมวดหมู่ยอดนิยม
            </h2>
            <Link
              href="/categories"
              className="inline-flex min-h-[44px] items-center px-2 text-xs font-bold text-[#4A4A45] underline-offset-4 hover:underline dark:text-[#D4D4CE]"
            >
              ดูทุกหมวด
            </Link>
          </div>
          <CategoryPillsRow categories={categories} />
        </section>

        <section aria-labelledby="ai-picks-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="ai-picks-heading"
              className="flex items-center gap-1.5 text-base font-extrabold"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C6F432] text-[#111111]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>AI เลือกให้คุณ</span>
            </h2>
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center px-2 text-xs font-bold text-[#4A4A45] hover:underline dark:text-[#D4D4CE]"
            >
              ดูทั้งหมด
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl bg-[#F1F1EE] p-6 text-center text-sm font-medium text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
              กำลังเตรียมรายการสินค้าจากผู้ขายไทย กรุณาตรวจสอบการเชื่อมต่อระบบหลังบ้าน
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {aiPicks.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          )}
        </section>

        {newArrivals.length > 0 ? (
          <section aria-labelledby="new-arrivals-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="new-arrivals-heading" className="text-base font-extrabold">
                สินค้ามาใหม่จากสตูดิโอไทย
              </h2>
              <Link
                href="/products?sort=newest"
                className="inline-flex min-h-[44px] items-center px-2 text-xs font-bold text-[#4A4A45] hover:underline dark:text-[#D4D4CE]"
              >
                ทั้งหมด ({products.length})
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </MobileAppShell>
  );
}
