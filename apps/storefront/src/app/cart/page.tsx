import { NongTammadiMascot } from "@tamadee/ui";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { PromoAndPaymentCard } from "../../components/cart/PromoAndPaymentCard";
import { SellerGroupCard } from "../../components/cart/SellerGroupCard";
import { DesktopCartView } from "../../components/desktop/DesktopCartView";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { getServerI18n } from "../../data/i18n-server";
import { buildPageMetadata } from "../../data/seo";
import { getServerCart, getServerCustomer } from "../../data/session";
import { computeCartSummary, groupCartBySeller } from "../../domain/pricing";

export const metadata: Metadata = buildPageMetadata({
  title: "ตะกร้าสินค้าแยกร้าน | Shopping Bag",
  description: "ตรวจสอบรายการสินค้า ค่าจัดส่งรายร้าน และสรุปยอดชำระเงินของคุณบน Tamadee",
  pathname: "/cart",
});

export default async function CartPage(): Promise<JSX.Element> {
  const [{ dict }, cart, customer] = await Promise.all([
    getServerI18n(),
    getServerCart(),
    getServerCustomer(),
  ]);

  const groups = cart ? groupCartBySeller(cart.items) : [];
  const summary = computeCartSummary(cart);

  const mobileContent = (
    <>
      <TopBackHeader
        title={`${dict.cart.title} (${summary.totalQuantity})`}
        backHref="/products"
      />

      <div className="space-y-4 px-4 pt-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-[#F1F1EE] px-6 py-12 text-center dark:bg-[#1C1C1A]">
            <NongTammadiMascot size={92} />
            <h2 className="mt-4 text-base font-extrabold">
              {dict.cart.emptyTitle}
            </h2>
            <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
              {dict.cart.emptyDesc}
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-[#C6F432] px-6 text-xs font-extrabold text-[#111111]"
            >
              {dict.cart.startShopping}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
              {dict.cart.groupedSubtitle} ({groups.length})
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
    </>
  );

  return (
    <StorefrontShell
      showBottomNav={groups.length === 0}
      cartCount={summary.totalQuantity}
      mobileContent={mobileContent}
      desktopContent={
        <DesktopCartView
          groups={groups}
          summary={summary}
          appliedCodes={cart?.promoCodes ?? []}
          isLoggedIn={customer !== null}
          dict={dict}
        />
      }
    />
  );
}
