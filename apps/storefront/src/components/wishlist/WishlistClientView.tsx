"use client";

import { NongTammadiMascot } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductSummary } from "../../domain/types";
import { useLocale } from "../i18n/LocaleProvider";
import { ProductCard } from "../shared/ProductCard";
import { useWishlist } from "./WishlistProvider";

export interface WishlistClientViewProps {
  readonly allProducts: readonly ProductSummary[];
  readonly desktopGrid?: boolean;
}

export function WishlistClientView({
  allProducts,
  desktopGrid = false,
}: WishlistClientViewProps): JSX.Element {
  const { ids } = useWishlist();
  const { locale, dict } = useLocale();
  const likedProducts = allProducts.filter((p) => ids.has(p.id));

  if (likedProducts.length === 0) {
    const emptyTitle =
      locale === "en"
        ? "Your wishlist is empty"
        : locale === "zh"
          ? "心愿单还是空的"
          : "ยังไม่มีสินค้าในรายการถูกใจ";
    const emptySub =
      locale === "en"
        ? "Tap the heart icon on any item to save your favorite Thai crafts."
        : locale === "zh"
          ? "点击商品卡片右上角的爱心图标即可收藏心仪好物。"
          : "แตะไอคอนรูปหัวใจบนการ์ดสินค้าเพื่อเก็บชิ้นที่ชอบไว้ดูภายหลัง";

    return (
      <div className="flex flex-col items-center rounded-3xl bg-[#F1F1EE] px-6 py-12 text-center dark:bg-[#1C1C1A]">
        <NongTammadiMascot size={88} />
        <h2 className="mt-4 text-base font-extrabold">{emptyTitle}</h2>
        <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
          {emptySub}
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-[#C6F432] px-6 text-xs font-extrabold text-[#111111]"
        >
          {dict.nav.allProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-extrabold">
        {dict.nav.wishlist} ({likedProducts.length})
      </h2>
      <div
        className={
          desktopGrid
            ? "grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid grid-cols-2 gap-3"
        }
      >
        {likedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
