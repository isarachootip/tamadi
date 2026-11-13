import { ShieldCheck, Store, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { CartIconLink } from "../../../components/shared/CartIconLink";
import { ProductCard } from "../../../components/shared/ProductCard";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../../components/shell/MobileAppShell";
import {
  getSeller,
  listSellerProducts,
} from "../../../data/repositories/catalog-repo";
import { getServerCart } from "../../../data/session";
import { computeCartSummary } from "../../../domain/pricing";

interface SellerPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function SellerStorePage({
  params,
}: SellerPageProps): Promise<JSX.Element> {
  const { id } = await params;

  const [seller, products, cart] = await Promise.all([
    getSeller(id).catch(() => null),
    listSellerProducts(id).catch(() => []),
    getServerCart(),
  ]);

  if (!seller) {
    notFound();
  }

  const cartSummary = computeCartSummary(cart);

  return (
    <MobileAppShell>
      <TopBackHeader
        title={seller.name}
        backHref="/categories"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />

      <div className="space-y-5 px-4 pt-4">
        <section className="rounded-3xl bg-[#111111] p-5 text-white dark:border dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
          <div className="flex items-start gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C6F432] text-[#111111]">
              <Store className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-[#C6F432]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ผู้ขายที่ผ่านการอนุมัติจาก Tamadee
              </span>
              <h2 className="text-lg font-extrabold">{seller.name}</h2>
              {seller.description ? (
                <p className="text-xs leading-relaxed text-[#D4D4CE]">
                  {seller.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white">
            <Truck className="h-4 w-4 shrink-0 text-[#C6F432]" aria-hidden="true" />
            <span>
              จัดส่งโดยผู้ขายภายใน {seller.leadtimeDays ?? 2} วันทำการ • ค่าส่ง ฿40/ร้าน (ฟรีเมื่อครบ ฿3,000)
            </span>
          </div>
        </section>

        <section aria-labelledby="seller-products-heading" className="space-y-3">
          <h2 id="seller-products-heading" className="text-base font-extrabold">
            สินค้าจากร้านนี้ ({products.length})
          </h2>

          {products.length === 0 ? (
            <p className="rounded-2xl bg-[#F1F1EE] p-6 text-center text-sm text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
              ร้านนี้กำลังเตรียมเพิ่มสินค้าใหม่เร็วๆ นี้
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 2}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileAppShell>
  );
}
