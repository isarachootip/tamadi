"use client";

import { Heart } from "lucide-react";
import type { JSX } from "react";
import { useWishlist } from "./WishlistProvider";

export interface WishlistHeartButtonProps {
  readonly productId: string;
  readonly productTitle: string;
  readonly className?: string;
}

export function WishlistHeartButton({
  productId,
  productTitle,
  className = "",
}: WishlistHeartButtonProps): JSX.Element {
  const { has, toggle } = useWishlist();
  const liked = has(productId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(productId);
      }}
      aria-label={
        liked
          ? `นำ ${productTitle} ออกจากรายการถูกใจ`
          : `เพิ่ม ${productTitle} ในรายการถูกใจ`
      }
      aria-pressed={liked}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/95 text-[#111111] shadow-sm transition hover:scale-105 dark:bg-[#1C1C1A]/95 dark:text-white ${className}`}
    >
      <Heart
        className={`h-5 w-5 ${
          liked ? "fill-[#E11D48] text-[#E11D48]" : "text-current"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
