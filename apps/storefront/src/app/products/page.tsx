import Link from "next/link";
import type { JSX } from "react";
import { ProductFilterBar } from "../../components/catalog/ProductFilterBar";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { ProductCard } from "../../components/shared/ProductCard";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../components/shell/MobileAppShell";
import {
  listCategories,
  listProducts,
} from "../../data/repositories/catalog-repo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";
import type { ProductSortOption } from "../../domain/types";

interface ProductsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const val = params[key];
  if (typeof val === "string" && val.trim().length > 0) {
    return val.trim();
  }
  return undefined;
}

function parseOptionalNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<JSX.Element> {
  const resolvedParams = await searchParams;
  const q = readParam(resolvedParams, "q");
  const categoryId = readParam(resolvedParams, "category");
  const minPrice = parseOptionalNumber(readParam(resolvedParams, "minPrice"));
  const maxPrice = parseOptionalNumber(readParam(resolvedParams, "maxPrice"));
  const rawSort = readParam(resolvedParams, "sort");
  const sort: ProductSortOption =
    rawSort === "newest" || rawSort === "price_asc" || rawSort === "price_desc"
      ? rawSort
      : "recommended";

  const [categories, products, cart] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({ q, categoryId, minPrice, maxPrice, sort }).catch(() => []),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <MobileAppShell>
      <TopBackHeader
        title={selectedCategory ? selectedCategory.name : "สินค้าทั้งหมด"}
        backHref="/categories"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />

      <div className="space-y-4 px-4 pt-4">
        <ProductFilterBar
          categories={categories}
          q={q}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">
            พบสินค้า {products.length} รายการ
          </h2>
          {q || categoryId || minPrice !== undefined || maxPrice !== undefined ? (
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center px-2 text-xs font-bold text-[#4A4A45] underline dark:text-[#D4D4CE]"
            >
              ล้างตัวกรอง
            </Link>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-[#F1F1EE] p-8 text-center dark:bg-[#1C1C1A]">
            <p className="text-sm font-bold">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
            <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
              ลองเปลี่ยนคำค้นหาหรือขยายช่วงราคาดูอีกครั้ง
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}
