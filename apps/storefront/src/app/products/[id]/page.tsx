import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { DesktopProductDetailView } from "../../../components/desktop/DesktopProductDetailView";
import { ProductGallery } from "../../../components/product/ProductGallery";
import { VariantPurchasePanel } from "../../../components/product/VariantPurchasePanel";
import { CartIconLink } from "../../../components/shared/CartIconLink";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../../components/shell/StorefrontShell";
import { getServerI18n } from "../../../data/i18n-server";
import { getProductDetail } from "../../../data/repositories/catalog-repo";
import { buildPageMetadata, buildProductJsonLd } from "../../../data/seo";
import { getServerCart } from "../../../data/session";
import { buildGalleryUrls } from "../../../domain/catalog-logic";
import { computeCartSummary } from "../../../domain/pricing";

interface ProductDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getProductDetail(id).catch(() => null);
  if (!detail) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "The requested item could not be found.",
      pathname: `/products/${encodeURIComponent(id)}`,
    });
  }
  return buildPageMetadata({
    title: detail.title,
    description:
      detail.description ??
      detail.subtitle ??
      `${detail.title} — Tamadee Marketplace`,
    pathname: `/products/${encodeURIComponent(detail.id)}`,
    imageUrl: detail.images[0] ?? detail.thumbnail,
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<JSX.Element> {
  const [{ id }, { locale, dict }] = await Promise.all([
    params,
    getServerI18n(),
  ]);

  const [detail, cart] = await Promise.all([
    getProductDetail(id, locale).catch(() => null),
    getServerCart(),
  ]);

  if (!detail) {
    notFound();
  }

  const cartSummary = computeCartSummary(cart);
  const galleryUrls = buildGalleryUrls(detail);
  const productJsonLd = buildProductJsonLd(detail);

  const mobileContent = (
    <>
      <TopBackHeader
        title={dict.product.detailTitle}
        backHref="/products"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />

      <div className="space-y-4 px-4 pt-4">
        <ProductGallery
          productId={detail.id}
          title={detail.title}
          urls={galleryUrls}
        />

        <div className="space-y-1.5">
          {detail.categoryNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.categoryNames.map((catName) => (
                <span
                  key={catName}
                  className="rounded-full bg-[#F1F1EE] px-3 py-0.5 text-xs font-bold text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]"
                >
                  {catName}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="text-xl leading-snug font-extrabold tracking-tight">
            {detail.title}
          </h1>
          {detail.subtitle ? (
            <p className="text-sm font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
              {detail.subtitle}
            </p>
          ) : null}
        </div>

        {detail.description ? (
          <section aria-labelledby="desc-heading" className="space-y-1">
            <h2 id="desc-heading" className="text-xs font-extrabold uppercase">
              {dict.product.storyHeading}
            </h2>
            <p className="text-sm leading-relaxed text-[#4A4A45] dark:text-[#D4D4CE]">
              {detail.description}
            </p>
          </section>
        ) : null}

        <VariantPurchasePanel detail={detail} />
      </div>
    </>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <StorefrontShell
        showBottomNav={false}
        cartCount={cartSummary.totalQuantity}
        mobileContent={mobileContent}
        desktopContent={
          <DesktopProductDetailView
            detail={detail}
            galleryUrls={galleryUrls}
            dict={dict}
          />
        }
      />
    </>
  );
}
