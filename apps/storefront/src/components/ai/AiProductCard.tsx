"use client";

import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type JSX } from "react";
import { addToCartAction } from "../../actions/cart-actions";
import type { AiRecommendedProduct } from "../../data/schemas/ai-schemas";
import { formatThb } from "../../domain/pricing";
import { ProductImage } from "../shared/ProductImage";

export interface AiProductCardProps {
  readonly product: AiRecommendedProduct;
}

export function AiProductCard({ product }: AiProductCardProps): JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleAddToCart(): void {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addToCartAction({
        offerId: product.offerId,
        quantity: 1,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      });
      if (!res.ok) {
        setErrorMsg(res.message ?? "เพิ่มไม่สำเร็จ");
        return;
      }
      setAdded(true);
      router.refresh();
    });
  }

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#2E2E2B] bg-[#111111] transition hover:border-[#C6F432]">
      <Link
        href={`/products/${encodeURIComponent(product.id)}`}
        className="block"
      >
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          sizes="(max-width: 768px) 170px, 220px"
        />
        <div className="space-y-1 p-3">
          <p className="line-clamp-1 text-xs font-extrabold text-white">
            {product.title}
          </p>
          <p className="line-clamp-1 text-[11px] text-[#9E9E96]">
            {product.sellerName} • {product.variantTitle}
          </p>
          <p className="font-display text-sm font-extrabold text-[#C6F432]">
            {formatThb(product.priceAmount)}
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleAddToCart}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#C6F432] px-3 text-xs font-extrabold text-[#111111] transition hover:brightness-95 disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>อยู่ในตะกร้าแล้ว</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isPending ? "กำลังเพิ่ม..." : "ใส่ตะกร้า"}</span>
            </>
          )}
        </button>
        {errorMsg ? (
          <p className="mt-1 text-center text-[11px] text-[#FCA5A5]">
            {errorMsg}
          </p>
        ) : null}
      </div>
    </article>
  );
}
