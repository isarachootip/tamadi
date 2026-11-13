import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

export interface CartIconLinkProps {
  readonly count: number;
}

export function CartIconLink({ count }: CartIconLinkProps): JSX.Element {
  const label =
    count > 0 ? `ตะกร้าสินค้า มี ${count} ชิ้น` : "ตะกร้าสินค้า";

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F1F1EE] text-[#111111] transition hover:bg-[#E2E2DC] dark:bg-[#1C1C1A] dark:text-white dark:hover:bg-[#2E2E2B]"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="font-display absolute -top-1 -right-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#C6F432] px-1 text-[11px] font-bold text-[#111111] ring-2 ring-white dark:ring-[#111111]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
