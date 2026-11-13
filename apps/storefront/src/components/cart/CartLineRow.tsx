"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type JSX } from "react";
import {
  removeCartLineAction,
  updateCartLineAction,
} from "../../actions/cart-actions";
import { formatThb } from "../../domain/pricing";
import type { CartLineItem } from "../../domain/types";
import { ProductImage } from "../shared/ProductImage";

export interface CartLineRowProps {
  readonly item: CartLineItem;
}

export function CartLineRow({ item }: CartLineRowProps): JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeQty(nextQty: number): void {
    startTransition(async () => {
      await updateCartLineAction({ lineItemId: item.id, quantity: nextQty });
      router.refresh();
    });
  }

  function removeLine(): void {
    startTransition(async () => {
      await removeCartLineAction(item.id);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Link
        href={`/products/${encodeURIComponent(item.productId)}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
      >
        <ProductImage
          src={item.thumbnail}
          alt={item.title}
          sizes="80px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${encodeURIComponent(item.productId)}`}
              className="line-clamp-1 text-sm font-extrabold hover:underline"
            >
              {item.title}
            </Link>
            {item.variantTitle ? (
              <p className="text-xs font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
                ตัวเลือก: {item.variantTitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={removeLine}
            aria-label={`ลบ ${item.title} ออกจากตะกร้า`}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#4A4A45] transition hover:bg-black/5 hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-display text-sm font-extrabold text-[#111111] dark:text-[#C6F432]">
            {formatThb(item.unitPrice * item.quantity)}
          </p>

          <div className="flex items-center rounded-full bg-white ring-1 ring-[#E2E2DC] dark:bg-[#111111] dark:ring-[#2E2E2B]">
            <button
              type="button"
              disabled={isPending}
              onClick={() => changeQty(item.quantity - 1)}
              aria-label={`ลดจำนวน ${item.title}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="font-display min-w-[24px] text-center text-xs font-extrabold">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => changeQty(item.quantity + 1)}
              aria-label={`เพิ่มจำนวน ${item.title}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
