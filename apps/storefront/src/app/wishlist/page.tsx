import type { Metadata } from "next";
import type { JSX } from "react";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { WishlistClientView } from "../../components/wishlist/WishlistClientView";
import { listProducts } from "../../data/repositories/catalog-repo";
import { buildPageMetadata } from "../../data/seo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";

export const metadata: Metadata = buildPageMetadata({
  title: "รายการสินค้าที่ถูกใจ",
  description: "รวมสินค้าที่คุณกดหัวใจบันทึกไว้บน Tamadee",
  pathname: "/wishlist",
});

export default async function WishlistPage(): Promise<JSX.Element> {
  const [products, cart] = await Promise.all([
    listProducts().catch(() => []),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);

  return (
    <StorefrontShell
      cartCount={cartSummary.totalQuantity}
      mobileContent={
        <>
          <TopBackHeader
            title="รายการถูกใจ"
            rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
          />
          <div className="px-4 pt-4">
            <WishlistClientView allProducts={products} />
          </div>
        </>
      }
      desktopContent={
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold">รายการสินค้าที่ถูกใจ</h1>
          <WishlistClientView allProducts={products} desktopGrid />
        </div>
      }
    />
  );
}
