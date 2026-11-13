import Link from "next/link";
import type { JSX } from "react";
import { formatThb } from "../../domain/pricing";
import type { ProductSummary } from "../../domain/types";
import { WishlistHeartButton } from "../wishlist/WishlistHeartButton";
import { ProductImage } from "./ProductImage";

export interface ProductCardProps {
  readonly product: ProductSummary;
  readonly priority?: boolean;
}

export function ProductCard({
  product,
  priority = false,
}: ProductCardProps): JSX.Element {
  const categoryTag = product.categoryNames[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#E2E2DC] bg-white transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]">
      <div className="relative">
        <Link
          href={`/products/${encodeURIComponent(product.id)}`}
          className="block focus:outline-none"
        >
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            priority={priority}
          />
        </Link>
        <div className="absolute top-2 right-2 z-10">
          <WishlistHeartButton
            productId={product.id}
            productTitle={product.title}
          />
        </div>
      </div>

      <Link
        href={`/products/${encodeURIComponent(product.id)}`}
        className="flex flex-1 flex-col justify-between gap-2 p-3.5"
      >
        <div className="space-y-1">
          {categoryTag ? (
            <span className="inline-block rounded-full bg-[#F1F1EE] px-2.5 py-0.5 text-[11px] font-bold text-[#4A4A45] dark:bg-[#2A2A27] dark:text-[#D4D4CE]">
              {categoryTag}
            </span>
          ) : null}
          <h3 className="line-clamp-2 text-sm leading-snug font-bold text-[#111111] dark:text-white">
            {product.title}
          </h3>
        </div>

        <p className="font-display text-base font-extrabold tracking-tight text-[#111111] dark:text-[#C6F432]">
          {formatThb(product.priceAmount)}
        </p>
      </Link>
    </article>
  );
}
