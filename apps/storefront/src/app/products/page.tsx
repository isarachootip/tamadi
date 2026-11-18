import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { ProductFilterBar } from "../../components/catalog/ProductFilterBar";
import { DesktopCatalogView } from "../../components/desktop/DesktopCatalogView";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { ProductCard } from "../../components/shared/ProductCard";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { getServerI18n } from "../../data/i18n-server";
import {
  listCategories,
  listProducts,
} from "../../data/repositories/catalog-repo";
import { buildPageMetadata } from "../../data/seo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";
import type { ProductSortOption } from "../../domain/types";

export const metadata: Metadata = buildPageMetadata({
  title: "ค้นหาและเลือกชมสินค้าทั้งหมด | All Products",
  description:
    "รวมสินค้าทำมาดีจากผู้ขายไทย เสื้อผ้า รองเท้า กระเป๋า เครื่องประดับ และของแต่งบ้านงานคราฟต์ กรองตามหมวดและช่วงราคาได้",
  pathname: "/products",
});

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
  const [resolvedParams, { locale, dict }] = await Promise.all([
    searchParams,
    getServerI18n(),
  ]);
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
    listCategories(locale).catch(() => []),
    listProducts({ q, categoryId, minPrice, maxPrice, sort }, locale).catch(
      () => []
    ),
    getServerCart(),
  ]);

  const cartSummary = computeCartSummary(cart);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const mobileContent = (
    <>
      <TopBackHeader
        title={selectedCategory ? selectedCategory.name : dict.nav.allProducts}
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
          dict={dict}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">
            {dict.catalog.foundCountPrefix} {products.length}{" "}
            {dict.catalog.foundCountSuffix}
          </h2>
          {q || categoryId || minPrice !== undefined || maxPrice !== undefined ? (
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center px-2 text-xs font-bold text-[#4A4A45] underline dark:text-[#D4D4CE]"
            >
              {dict.catalog.clearFilters}
            </Link>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-[#F1F1EE] p-8 text-center dark:bg-[#1C1C1A]">
            <p className="text-sm font-bold">{dict.catalog.emptySearchTitle}</p>
            <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
              {dict.catalog.emptySearchDesc}
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
    </>
  );

  return (
    <StorefrontShell
      categories={categories}
      cartCount={cartSummary.totalQuantity}
      searchQuery={q}
      mobileContent={mobileContent}
      desktopContent={
        <DesktopCatalogView
          categories={categories}
          products={products}
          q={q}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          dict={dict}
        />
      }
    />
  );
}
