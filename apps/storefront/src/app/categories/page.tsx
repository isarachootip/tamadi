import { ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../components/shell/MobileAppShell";
import {
  listCategories,
  listProducts,
  listSellers,
} from "../../data/repositories/catalog-repo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";

export default async function CategoriesPage(): Promise<JSX.Element> {
  const [categories, products, sellers, cart] = await Promise.all([
    listCategories().catch(() => []),
    listProducts().catch(() => []),
    listSellers().catch(() => []),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);

  return (
    <MobileAppShell>
      <TopBackHeader
        title="หมวดหมู่และร้านค้า"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />

      <div className="space-y-6 px-4 pt-4">
        <section aria-labelledby="cat-list-heading" className="space-y-3">
          <h2 id="cat-list-heading" className="text-base font-extrabold">
            เลือกช้อปตามหมวดหมู่ ({categories.length})
          </h2>
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const count = products.filter((p) =>
                p.categoryIds.includes(cat.id)
              ).length;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="flex min-h-[64px] items-center justify-between rounded-2xl border border-[#E2E2DC] bg-[#F1F1EE] px-4 py-3 transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]"
                >
                  <div>
                    <p className="text-sm font-extrabold">{cat.name}</p>
                    <p className="text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                      {cat.description ?? `${count} รายการพร้อมส่ง`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display rounded-full bg-[#C6F432] px-2.5 py-0.5 text-xs font-bold text-[#111111]">
                      {count}
                    </span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="sellers-heading" className="space-y-3">
          <h2 id="sellers-heading" className="text-base font-extrabold">
            ร้านค้าผู้สร้างสรรค์ไทย ({sellers.length})
          </h2>
          <div className="space-y-2.5">
            {sellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/sellers/${encodeURIComponent(seller.id)}`}
                className="flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-[#E2E2DC] bg-white px-4 py-3 transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]">
                    <Store className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">{seller.name}</p>
                    <p className="line-clamp-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                      {seller.description ?? "ผู้ขายที่ผ่านการคัดสรรโดย Tamadee"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileAppShell>
  );
}
