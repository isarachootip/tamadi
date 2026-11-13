import { NongTammadiMascot } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import { PromoAndPaymentCard } from "../../components/cart/PromoAndPaymentCard";
import { SellerGroupCard } from "../../components/cart/SellerGroupCard";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../components/shell/MobileAppShell";
import { getServerCart, getServerCustomer } from "../../data/session";
import { computeCartSummary, groupCartBySeller } from "../../domain/pricing";

export default async function CartPage(): Promise<JSX.Element> {
  const [cart, customer] = await Promise.all([
    getServerCart(),
    getServerCustomer(),
  ]);

  const groups = cart ? groupCartBySeller(cart.items) : [];
  const summary = computeCartSummary(cart);

  return (
    <MobileAppShell showBottomNav={groups.length === 0}>
      <TopBackHeader
        title={`ตะกร้าสินค้า (${summary.totalQuantity})`}
        backHref="/products"
      />

      <div className="space-y-4 px-4 pt-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-[#F1F1EE] px-6 py-12 text-center dark:bg-[#1C1C1A]">
            <NongTammadiMascot size={92} />
            <h2 className="mt-4 text-base font-extrabold">
              ตะกร้าของคุณยังว่างอยู่
            </h2>
            <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
              ลองเลือกชมเสื้อผ้าลินิน รองเท้าหนัง หรือเซรามิกทำมือจากร้านค้าไทยดูสิ
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-[#C6F432] px-6 text-xs font-extrabold text-[#111111]"
            >
              เริ่มเลือกช้อปสินค้า
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
              จัดกลุ่มตามร้านค้าผู้ขาย ({groups.length} ร้าน) • ผู้ขายแต่ละร้านจัดส่งแยกกล่อง
            </p>

            {groups.map((group) => (
              <SellerGroupCard key={group.sellerId} group={group} />
            ))}

            <PromoAndPaymentCard
              summary={summary}
              appliedCodes={cart?.promoCodes ?? []}
              isLoggedIn={customer !== null}
            />
          </>
        )}
      </div>
    </MobileAppShell>
  );
}
