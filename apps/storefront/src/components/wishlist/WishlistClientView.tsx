"use client";

import { NongTammadiMascot } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductSummary } from "../../domain/types";
import { ProductCard } from "../shared/ProductCard";
import { useWishlist } from "./WishlistProvider";

export interface WishlistClientViewProps {
  readonly allProducts: readonly ProductSummary[];
}

export function WishlistClientView({
  allProducts,
}: WishlistClientViewProps): JSX.Element {
  const { ids } = useWishlist();
  const likedProducts = allProducts.filter((p) => ids.has(p.id));

  if (likedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-[#F1F1EE] px-6 py-12 text-center dark:bg-[#1C1C1A]">
        <NongTammadiMascot size={88} />
        <h2 className="mt-4 text-base font-extrabold">
          ยังไม่มีสินค้าในรายการถูกใจ
        </h2>
        <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
          แตะไอคอนรูปหัวใจบนการ์ดสินค้าเพื่อเก็บชิ้นที่ชอบไว้ดูภายหลัง
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-[#C6F432] px-6 text-xs font-extrabold text-[#111111]"
        >
          ไปหน้าสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-extrabold">
        สินค้าที่คุณถูกใจ ({likedProducts.length} ชิ้น)
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {likedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
