import type { Metadata } from "next";
import type { JSX } from "react";
import { VisualSearchPanel } from "../../components/ai/VisualSearchPanel";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { getServerI18n } from "../../data/i18n-server";
import { buildPageMetadata } from "../../data/seo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";

export const metadata: Metadata = buildPageMetadata({
  title: "ค้นหาสินค้าด้วยรูปภาพ (Visual Search)",
  description:
    "ถ่ายรูปหรืออัปโหลดภาพสินค้าที่ชอบเพื่อค้นหาเสื้อผ้า รองเท้า กระเป๋า และงานคราฟต์ที่คล้ายกันบน Tamadee",
  pathname: "/visual-search",
});

export default async function VisualSearchPage(): Promise<JSX.Element> {
  const [{ dict }, cart] = await Promise.all([
    getServerI18n(),
    getServerCart(),
  ]);
  const cartSummary = computeCartSummary(cart);

  return (
    <StorefrontShell
      narrowDesktop
      cartCount={cartSummary.totalQuantity}
      mobileContent={
        <>
          <TopBackHeader
            title={dict.nav.visualSearchLabel}
            backHref="/"
            rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
          />
          <div className="px-4 pt-4">
            <VisualSearchPanel />
          </div>
        </>
      }
      desktopContent={
        <div className="space-y-5">
          <h1 className="text-3xl font-extrabold">
            {dict.nav.visualSearchLabel}
          </h1>
          <VisualSearchPanel />
        </div>
      }
    />
  );
}
