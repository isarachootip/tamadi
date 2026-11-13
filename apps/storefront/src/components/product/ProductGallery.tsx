"use client";

import Image from "next/image";
import { useState, type JSX } from "react";
import { ProductImage } from "../shared/ProductImage";
import { WishlistHeartButton } from "../wishlist/WishlistHeartButton";

export interface ProductGalleryProps {
  readonly productId: string;
  readonly title: string;
  readonly urls: readonly string[];
}

export function ProductGallery({
  productId,
  title,
  urls,
}: ProductGalleryProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = urls[activeIndex] ?? urls[0];

  return (
    <section aria-label="รูปภาพสินค้า" className="space-y-2.5">
      <div className="relative overflow-hidden rounded-3xl">
        <ProductImage
          src={activeUrl}
          alt={title}
          priority
          sizes="(max-width: 430px) 92vw, 400px"
        />
        <div className="absolute top-3 right-3 z-10">
          <WishlistHeartButton productId={productId} productTitle={title} />
        </div>
        {urls.length > 1 ? (
          <span className="font-display absolute bottom-3 left-3 rounded-full bg-[#111111]/85 px-3 py-1 text-xs font-bold text-white">
            {activeIndex + 1} / {urls.length}
          </span>
        ) : null}
      </div>

      {urls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, idx) => {
            const selected = idx === activeIndex;
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`ดูรูปสินค้าที่ ${idx + 1}`}
                aria-pressed={selected}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                  selected
                    ? "border-[#111111] dark:border-[#C6F432]"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={url}
                  alt={`${title} มุมที่ ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
