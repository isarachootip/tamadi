"use client";

import { NongTammadiMascot } from "@tamadee/ui";
import Image from "next/image";
import { useState, type JSX } from "react";

export interface ProductImageProps {
  readonly src?: string;
  readonly alt: string;
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly className?: string;
}

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 430px) 46vw, 200px",
  className = "",
}: ProductImageProps): JSX.Element {
  const [failed, setFailed] = useState(false);

  if (!src || src.trim().length === 0 || failed) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center bg-[#F1F1EE] dark:bg-[#1C1C1A] ${className}`}
      >
        <NongTammadiMascot size={56} title={alt} />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden bg-[#F1F1EE] dark:bg-[#1C1C1A] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}
