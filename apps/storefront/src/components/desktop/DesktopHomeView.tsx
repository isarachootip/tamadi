import { NongTammadiMascot } from "@tamadee/ui";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductCategory, ProductSummary } from "../../domain/types";
import { getUiDictionary, type UiDictionary } from "../../i18n";
import { ProductCard } from "../shared/ProductCard";

export interface DesktopHomeViewProps {
  readonly categories: readonly ProductCategory[];
  readonly products: readonly ProductSummary[];
  readonly dict?: UiDictionary;
}

export function DesktopHomeView({
  categories,
  products,
  dict = getUiDictionary("th"),
}: DesktopHomeViewProps): JSX.Element {
  const featured = products.slice(0, 5);
  const arrivals = products.slice(5, 25);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#111111] px-8 py-10 text-white lg:px-14 lg:py-14 dark:border dark:border-[#2E2E2B] dark:bg-[#181816]">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C6F432] px-4 py-1 text-xs font-extrabold text-[#111111]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.home.heroBadge}</span>
            </span>

            <h1 className="text-4xl leading-tight font-extrabold tracking-tight lg:text-5xl">
              {dict.home.heroTitle}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[#D4D4CE]">
              {dict.home.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[#C6F432] px-7 text-sm font-extrabold text-[#111111] transition hover:brightness-95"
              >
                <span>{dict.home.shopNow}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/ai"
                className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-extrabold text-white transition hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4 text-[#C6F432]" aria-hidden="true" />
                <span>{dict.home.askAiOutfit}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3 text-xs font-semibold text-[#E2E2DC]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#C6F432]" aria-hidden="true" />
                <span>{dict.home.trustApproved}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3 text-xs font-semibold text-[#E2E2DC]">
                <Truck className="h-4 w-4 shrink-0 text-[#C6F432]" aria-hidden="true" />
                <span>{dict.home.trustDirectShip}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3 text-xs font-semibold text-[#E2E2DC]">
                <Store className="h-4 w-4 shrink-0 text-[#C6F432]" aria-hidden="true" />
                <span>{dict.home.trustVatIncluded}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-4">
            <div className="flex h-60 w-60 items-center justify-center rounded-[2.5rem] bg-white/5 ring-1 ring-white/10">
              <NongTammadiMascot variant="dark" size={168} />
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="desktop-cats-heading" className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 id="desktop-cats-heading" className="text-2xl font-extrabold">
                {dict.home.shopByCategory}
              </h2>
              <p className="text-sm text-[#4A4A45] dark:text-[#D4D4CE]">
                {dict.home.categorySub}
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex min-h-[44px] items-center text-sm font-extrabold hover:underline"
            >
              {dict.home.viewAllCategories} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((cat) => {
              const count = products.filter((p) =>
                p.categoryIds.includes(cat.id)
              ).length;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="group flex flex-col justify-between rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-5 transition hover:-translate-y-0.5 hover:border-[#111111] hover:bg-white dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]"
                >
                  <span className="font-display inline-flex w-fit rounded-full bg-[#111111] px-3 py-0.5 text-xs font-bold text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]">
                    {count} {dict.home.itemsUnit}
                  </span>
                  <div className="mt-6">
                    <h3 className="text-lg font-extrabold">{cat.name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                      {cat.description ?? ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="desktop-ai-heading" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2
            id="desktop-ai-heading"
            className="flex items-center gap-2.5 text-2xl font-extrabold"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C6F432] text-[#111111]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>{dict.home.aiPicks}</span>
          </h2>
          <Link
            href="/products"
            className="inline-flex min-h-[44px] items-center text-sm font-extrabold hover:underline"
          >
            {dict.home.viewAll} ({products.length}) →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-[#F1F1EE] p-10 text-center text-base font-medium text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
            {dict.home.emptyCatalog}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 5}
              />
            ))}
          </div>
        )}
      </section>

      {arrivals.length > 0 ? (
        <section aria-labelledby="desktop-new-heading" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 id="desktop-new-heading" className="text-2xl font-extrabold">
              {dict.home.newArrivals}
            </h2>
            <Link
              href="/products?sort=newest"
              className="inline-flex min-h-[44px] items-center text-sm font-extrabold hover:underline"
            >
              {dict.home.sortByNewest} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
