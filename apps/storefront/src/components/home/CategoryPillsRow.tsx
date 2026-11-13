import Link from "next/link";
import type { JSX } from "react";
import type { ProductCategory } from "../../domain/types";

export interface CategoryPillsRowProps {
  readonly categories: readonly ProductCategory[];
  readonly activeCategoryId?: string;
}

export function CategoryPillsRow({
  categories,
  activeCategoryId,
}: CategoryPillsRowProps): JSX.Element {
  return (
    <div
      role="navigation"
      aria-label="หมวดหมู่สินค้า"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href="/products"
        className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-xs font-extrabold transition ${
          !activeCategoryId
            ? "bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
            : "bg-[#F1F1EE] text-[#111111] hover:bg-[#E2E2DC] dark:bg-[#1C1C1A] dark:text-white"
        }`}
      >
        ทั้งหมด
      </Link>
      {categories.map((cat) => {
        const active = activeCategoryId === cat.id;
        return (
          <Link
            key={cat.id}
            href={`/products?category=${encodeURIComponent(cat.id)}`}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-xs font-bold transition ${
              active
                ? "bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
                : "bg-[#F1F1EE] text-[#111111] hover:bg-[#E2E2DC] dark:bg-[#1C1C1A] dark:text-white"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
