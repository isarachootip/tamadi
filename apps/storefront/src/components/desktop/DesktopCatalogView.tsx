import Link from "next/link";
import type { JSX } from "react";
import type {
  ProductCategory,
  ProductSortOption,
  ProductSummary,
} from "../../domain/types";
import { ProductCard } from "../shared/ProductCard";

export interface DesktopCatalogViewProps {
  readonly categories: readonly ProductCategory[];
  readonly products: readonly ProductSummary[];
  readonly q?: string;
  readonly categoryId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sort: ProductSortOption;
}

export function DesktopCatalogView({
  categories,
  products,
  q,
  categoryId,
  minPrice,
  maxPrice,
  sort,
}: DesktopCatalogViewProps): JSX.Element {
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const hasFilters = Boolean(
    q || categoryId || minPrice !== undefined || maxPrice !== undefined
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <form
          action="/products"
          method="get"
          className="sticky top-28 space-y-6 rounded-3xl border border-[#E2E2DC] bg-[#F8F8F5] p-6 dark:border-[#2E2E2B] dark:bg-[#181816]"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">ตัวกรองสินค้า</h2>
            {hasFilters ? (
              <Link
                href="/products"
                className="text-xs font-bold text-[#4A4A45] underline dark:text-[#C6F432]"
              >
                ล้างทั้งหมด
              </Link>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="side-q" className="block text-xs font-extrabold">
              คำค้นหา
            </label>
            <input
              id="side-q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="เช่น ลินิน, เซรามิก..."
              className="min-h-[44px] w-full rounded-2xl border border-[#E2E2DC] bg-white px-3.5 text-sm dark:border-[#2E2E2B] dark:bg-[#111111]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="side-category"
              className="block text-xs font-extrabold"
            >
              หมวดหมู่
            </label>
            <select
              id="side-category"
              name="category"
              defaultValue={categoryId ?? ""}
              className="min-h-[44px] w-full rounded-2xl border border-[#E2E2DC] bg-white px-3 text-sm font-semibold dark:border-[#2E2E2B] dark:bg-[#111111]"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-extrabold">ช่วงราคา (บาท)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="minPrice"
                type="number"
                min={0}
                defaultValue={minPrice ?? ""}
                placeholder="ต่ำสุด"
                aria-label="ราคาต่ำสุด"
                className="min-h-[44px] w-full rounded-2xl border border-[#E2E2DC] bg-white px-3 text-sm dark:border-[#2E2E2B] dark:bg-[#111111]"
              />
              <input
                name="maxPrice"
                type="number"
                min={0}
                defaultValue={maxPrice ?? ""}
                placeholder="สูงสุด"
                aria-label="ราคาสูงสุด"
                className="min-h-[44px] w-full rounded-2xl border border-[#E2E2DC] bg-white px-3 text-sm dark:border-[#2E2E2B] dark:bg-[#111111]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="side-sort" className="block text-xs font-extrabold">
              เรียงลำดับตาม
            </label>
            <select
              id="side-sort"
              name="sort"
              defaultValue={sort}
              className="min-h-[44px] w-full rounded-2xl border border-[#E2E2DC] bg-white px-3 text-sm font-semibold dark:border-[#2E2E2B] dark:bg-[#111111]"
            >
              <option value="recommended">แนะนำโดย Tamadee</option>
              <option value="newest">สินค้ามาใหม่</option>
              <option value="price_asc">ราคา: ต่ำ → สูง</option>
              <option value="price_desc">ราคา: สูง → ต่ำ</option>
            </select>
          </div>

          <button
            type="submit"
            className="min-h-[46px] w-full rounded-2xl bg-[#111111] text-xs font-extrabold text-[#C6F432] transition hover:opacity-90 dark:bg-[#C6F432] dark:text-[#111111]"
          >
            กรองรายการสินค้า
          </button>
        </form>
      </aside>

      <section className="space-y-5 lg:col-span-9">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E2E2DC] pb-4 dark:border-[#2E2E2B]">
          <div>
            <h1 className="text-2xl font-extrabold">
              {selectedCategory ? selectedCategory.name : "สินค้าทั้งหมด"}
            </h1>
            {q ? (
              <p className="mt-0.5 text-sm text-[#4A4A45] dark:text-[#D4D4CE]">
                ผลการค้นหาสำหรับ “{q}”
              </p>
            ) : null}
          </div>
          <span className="text-sm font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
            พบ {products.length} รายการ
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-[#F1F1EE] p-12 text-center dark:bg-[#1C1C1A]">
            <p className="text-base font-extrabold">
              ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา
            </p>
            <p className="mt-1 text-sm text-[#4A4A45] dark:text-[#D4D4CE]">
              ลองเปลี่ยนคำค้นหาหรือกดล้างตัวกรองเพื่อดูสินค้าทั้งหมด
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
