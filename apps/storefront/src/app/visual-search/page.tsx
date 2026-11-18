import type { Metadata } from "next";
import type { JSX } from "react";
import { VisualSearchPanel } from "../../components/ai/VisualSearchPanel";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
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
  const cart = await getServerCart();
  const cartSummary = computeCartSummary(cart);

  return (
    <StorefrontShell
      narrowDesktop
      cartCount={cartSummary.totalQuantity}
      mobileContent={
        <>
          <TopBackHeader
            title="ค้นหาด้วยรูปภาพ"
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
            ค้นหาสินค้าด้วยรูปภาพ (Visual Search)
          </h1>
          <VisualSearchPanel />
        </div>
      }
    />
  );
}
