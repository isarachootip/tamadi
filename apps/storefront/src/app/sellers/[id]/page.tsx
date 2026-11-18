import { ShieldCheck, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { CartIconLink } from "../../../components/shared/CartIconLink";
import { ProductCard } from "../../../components/shared/ProductCard";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../../components/shell/StorefrontShell";
import { getServerI18n } from "../../../data/i18n-server";
import {
  getSeller,
  listSellerProducts,
} from "../../../data/repositories/catalog-repo";
import { buildPageMetadata } from "../../../data/seo";
import { getServerCart } from "../../../data/session";
import { computeCartSummary } from "../../../domain/pricing";

interface SellerPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSeller(id).catch(() => null);
  return buildPageMetadata({
    title: seller ? seller.name : "Creator Studio",
    description:
      seller?.description ?? "Approved Thai Creator Studio on Tamadee",
    pathname: `/sellers/${encodeURIComponent(id)}`,
  });
}

export default async function SellerStorePage({
  params,
}: SellerPageProps): Promise<JSX.Element> {
  const [{ id }, { locale, dict }] = await Promise.all([
    params,
    getServerI18n(),
  ]);

  const [seller, products, cart] = await Promise.all([
    getSeller(id, locale).catch(() => null),
    listSellerProducts(id, locale).catch(() => []),
    getServerCart(),
  ]);

  if (!seller) {
    notFound();
  }

  const cartSummary = computeCartSummary(cart);

  const sellerBanner = (
    <section className="rounded-3xl bg-[#111111] p-6 text-white lg:p-8 dark:border dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C6F432] text-[#111111]">
            <Store className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-[#C6F432]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.product.approvedCreator}
            </span>
            <h1 className="text-xl font-extrabold lg:text-2xl">{seller.name}</h1>
            {seller.description ? (
              <p className="max-w-2xl text-xs leading-relaxed text-[#D4D4CE] lg:text-sm">
                {seller.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white">
          <Truck className="h-4 w-4 shrink-0 text-[#C6F432]" aria-hidden="true" />
          <span>
            {dict.product.shipsInPrefix} {seller.leadtimeDays ?? 2}{" "}
            {dict.product.shipsInSuffix}
          </span>
        </div>
      </div>
    </section>
  );

  const mobileContent = (
    <>
      <TopBackHeader
        title={seller.name}
        backHref="/categories"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />
      <div className="space-y-5 px-4 pt-4">
        {sellerBanner}
        <section aria-labelledby="seller-products-heading" className="space-y-3">
          <h2 id="seller-products-heading" className="text-base font-extrabold">
            {dict.nav.allProducts} ({products.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>
        </section>
      </div>
    </>
  );

  const desktopContent = (
    <div className="space-y-8">
      {sellerBanner}
      <section aria-labelledby="desktop-seller-products" className="space-y-4">
        <h2 id="desktop-seller-products" className="text-2xl font-extrabold">
          {seller.name} ({products.length})
        </h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <StorefrontShell
      cartCount={cartSummary.totalQuantity}
      mobileContent={mobileContent}
      desktopContent={desktopContent}
    />
  );
}
