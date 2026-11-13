import { Store } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { formatThb } from "../../domain/pricing";
import type { SellerCartGroup } from "../../domain/types";
import { CartLineRow } from "./CartLineRow";

export interface SellerGroupCardProps {
  readonly group: SellerCartGroup;
}

export function SellerGroupCard({ group }: SellerGroupCardProps): JSX.Element {
  return (
    <section
      aria-label={`สินค้าจากร้าน ${group.sellerName}`}
      className="rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <div className="flex items-center justify-between border-b border-[#E2E2DC] pb-2.5 dark:border-[#2E2E2B]">
        <Link
          href={`/sellers/${encodeURIComponent(group.sellerId)}`}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-extrabold hover:underline"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]">
            <Store className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>{group.sellerName}</span>
        </Link>
        <span className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
          {group.shippingEstimate === 0
            ? "ส่งฟรี"
            : `ค่าส่ง ${formatThb(group.shippingEstimate)}`}
        </span>
      </div>

      <div className="divide-y divide-[#E2E2DC] pt-3 dark:divide-[#2E2E2B]">
        {group.items.map((item) => (
          <CartLineRow key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#E2E2DC] pt-2.5 text-xs font-bold dark:border-[#2E2E2B]">
        <span className="text-[#4A4A45] dark:text-[#D4D4CE]">
          ยอดสินค้าร้านนี้ ({group.items.length} รายการ)
        </span>
        <span className="font-display text-sm font-extrabold">
          {formatThb(group.subtotal)}
        </span>
      </div>
    </section>
  );
}
