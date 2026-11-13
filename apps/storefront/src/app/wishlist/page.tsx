import type { JSX } from "react";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../components/shell/MobileAppShell";
import { WishlistClientView } from "../../components/wishlist/WishlistClientView";
import { listProducts } from "../../data/repositories/catalog-repo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";

export default async function WishlistPage(): Promise<JSX.Element> {
  const [products, cart] = await Promise.all([
    listProducts().catch(() => []),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);

  return (
    <MobileAppShell>
      <TopBackHeader
        title="รายการถูกใจ"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />
      <div className="px-4 pt-4">
        <WishlistClientView allProducts={products} />
      </div>
    </MobileAppShell>
  );
}
