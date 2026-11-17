import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductDetail } from "../../domain/types";
import { ProductGallery } from "../product/ProductGallery";
import { VariantPurchasePanel } from "../product/VariantPurchasePanel";

export interface DesktopProductDetailViewProps {
  readonly detail: ProductDetail;
  readonly galleryUrls: readonly string[];
}

export function DesktopProductDetailView({
  detail,
  galleryUrls,
}: DesktopProductDetailViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <nav
        aria-label="เส้นทางหน้าเว็บ"
        className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#4A4A45] dark:text-[#D4D4CE]"
      >
        <Link href="/" className="hover:underline">
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/products" className="hover:underline">
          สินค้าทั้งหมด
        </Link>
        {detail.categoryNames[0] ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{detail.categoryNames[0]}</span>
          </>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-bold text-[#111111] dark:text-white">
          {detail.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="mx-auto max-w-xl lg:max-w-none">
            <ProductGallery
              productId={detail.id}
              title={detail.title}
              urls={galleryUrls}
            />
          </div>

          {detail.description ? (
            <section
              aria-labelledby="desktop-desc-heading"
              className="rounded-3xl border border-[#E2E2DC] bg-[#F8F8F5] p-6 dark:border-[#2E2E2B] dark:bg-[#181816]"
            >
              <h2
                id="desktop-desc-heading"
                className="text-sm font-extrabold tracking-wide uppercase"
              >
                เรื่องราวและรายละเอียดชิ้นงาน
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4A45] dark:text-[#D4D4CE]">
                {detail.description}
              </p>
            </section>
          ) : null}
        </div>

        <div className="sticky top-28 space-y-5 rounded-3xl border border-[#E2E2DC] bg-white p-7 shadow-sm lg:col-span-5 dark:border-[#2E2E2B] dark:bg-[#181816]">
          {detail.categoryNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detail.categoryNames.map((catName) => (
                <span
                  key={catName}
                  className="rounded-full bg-[#F1F1EE] px-3 py-1 text-xs font-bold text-[#4A4A45] dark:bg-[#252522] dark:text-[#D4D4CE]"
                >
                  {catName}
                </span>
              ))}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight">
              {detail.title}
            </h1>
            {detail.subtitle ? (
              <p className="text-sm font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
                {detail.subtitle}
              </p>
            ) : null}
          </div>

          <VariantPurchasePanel detail={detail} inlineActions />
        </div>
      </div>
    </div>
  );
}
