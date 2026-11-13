import type {
  CartLineItem,
  CartModel,
  CartSummaryTotals,
  SellerCartGroup,
} from "./types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatThb(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `฿${numberFormatter.format(safe)}`;
}

export function estimateSellerShipping(subtotal: number): number {
  return subtotal >= 3000 ? 0 : 40;
}

export function groupCartBySeller(
  items: readonly CartLineItem[]
): readonly SellerCartGroup[] {
  const buckets = new Map<string, CartLineItem[]>();
  const names = new Map<string, string>();

  for (const item of items) {
    const existing = buckets.get(item.sellerId);
    if (existing) {
      existing.push(item);
    } else {
      buckets.set(item.sellerId, [item]);
    }
    names.set(item.sellerId, item.sellerName);
  }

  const groups: SellerCartGroup[] = [];
  for (const [sellerId, sellerItems] of buckets.entries()) {
    const subtotal = sellerItems.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0
    );
    groups.push({
      sellerId,
      sellerName: names.get(sellerId) ?? "ร้านค้าทำมาดี",
      items: sellerItems,
      subtotal,
      shippingEstimate: estimateSellerShipping(subtotal),
    });
  }
  return groups;
}

export function computeCartSummary(cart: CartModel | null): CartSummaryTotals {
  if (!cart || cart.items.length === 0) {
    return {
      totalQuantity: 0,
      itemSubtotal: 0,
      shippingTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
    };
  }

  const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const computedItemsSubtotal =
    cart.itemSubtotal > 0
      ? cart.itemSubtotal
      : cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const groups = groupCartBySeller(cart.items);
  const shippingTotal =
    cart.shippingTotal > 0
      ? cart.shippingTotal
      : groups.reduce((sum, g) => sum + g.shippingEstimate, 0);

  const grandTotal = Math.max(
    0,
    computedItemsSubtotal + shippingTotal - cart.discountTotal
  );

  return {
    totalQuantity,
    itemSubtotal: computedItemsSubtotal,
    shippingTotal,
    discountTotal: cart.discountTotal,
    grandTotal,
  };
}
