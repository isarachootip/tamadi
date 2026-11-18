import { TamadeeLogo } from "@tamadee/ui";
import {
  Camera,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductCategory } from "../../domain/types";
import type { UiDictionary } from "../../i18n";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { DesktopThemeButton } from "./DesktopThemeButton";

export interface DesktopNavbarProps {
  readonly categories: readonly ProductCategory[];
  readonly cartCount: number;
  readonly searchQuery?: string;
  readonly dict: UiDictionary;
}

export function DesktopNavbar({
  categories,
  cartCount,
  searchQuery,
  dict,
}: DesktopNavbarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E2DC] bg-white/95 backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-5 px-6 py-3.5 lg:px-10">
        <Link
          href="/"
          aria-label={`Tamadee ${dict.nav.home}`}
          className="inline-flex min-h-[44px] shrink-0 items-center"
        >
          <span className="block dark:hidden">
            <TamadeeLogo variant="light" width={148} height={40} />
          </span>
          <span className="hidden dark:block">
            <TamadeeLogo variant="dark" width={148} height={40} />
          </span>
        </Link>

        <form
          action="/products"
          method="get"
          className="flex max-w-xl flex-1 items-center gap-2"
        >
          <label htmlFor="desktop-search-input" className="sr-only">
            {dict.nav.searchPlaceholder}
          </label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#4A4A45] dark:text-[#D4D4CE]"
              aria-hidden="true"
            />
            <input
              id="desktop-search-input"
              name="q"
              type="search"
              defaultValue={searchQuery ?? ""}
              placeholder={dict.nav.searchPlaceholder}
              className="min-h-[44px] w-full rounded-full border border-[#E2E2DC] bg-[#F1F1EE] pr-4 pl-11 text-sm font-medium text-[#111111] placeholder:text-[#4A4A45] focus:border-[#111111] focus:bg-white focus:outline-none dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:placeholder:text-[#D4D4CE] dark:focus:border-[#C6F432]"
            />
          </div>
          <Link
            href="/visual-search"
            aria-label={dict.nav.visualSearchLabel}
            title={dict.nav.visualSearchLabel}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-[#C6F432] dark:hover:border-[#C6F432]"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="submit"
            className="min-h-[44px] shrink-0 rounded-full bg-[#111111] px-5 text-xs font-extrabold text-[#C6F432] transition hover:opacity-90 dark:bg-[#C6F432] dark:text-[#111111]"
          >
            {dict.nav.searchBtn}
          </button>
        </form>

        <nav
          aria-label="Primary actions"
          className="flex shrink-0 items-center gap-2"
        >
          <LanguageSwitcher />

          <Link
            href="/ai"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#C6F432] px-3.5 text-xs font-extrabold text-[#111111] transition hover:brightness-95"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{dict.nav.askAi}</span>
            <span className="2xl:hidden">AI</span>
          </Link>

          <DesktopThemeButton />

          <Link
            href="/wishlist"
            aria-label={dict.nav.wishlist}
            className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:hover:border-[#C6F432]"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/account"
            aria-label={dict.nav.account}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#E2E2DC] bg-[#F1F1EE] px-3.5 text-xs font-extrabold text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:hover:border-[#C6F432]"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">{dict.nav.account}</span>
          </Link>

          <Link
            href="/cart"
            aria-label={`${dict.nav.cart} (${cartCount})`}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#111111] px-3.5 text-xs font-extrabold text-white transition hover:opacity-90 dark:bg-white dark:text-[#111111]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>{dict.nav.cart}</span>
            <span className="font-display inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#C6F432] px-1.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>

      <div className="border-t border-[#E2E2DC]/70 bg-[#F8F8F5] dark:border-[#2E2E2B] dark:bg-[#161614]">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 overflow-x-auto px-6 py-1.5 lg:px-10">
          <div className="flex items-center gap-1">
            <Link
              href="/products"
              className="inline-flex min-h-[42px] items-center rounded-full px-3.5 text-xs font-extrabold text-[#111111] transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            >
              {dict.nav.allProducts}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="inline-flex min-h-[42px] items-center rounded-full px-3.5 text-xs font-bold text-[#4A4A45] transition hover:bg-black/5 hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:bg-white/10 dark:hover:text-[#C6F432]"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/categories"
              className="inline-flex min-h-[42px] items-center rounded-full px-3.5 text-xs font-bold text-[#4A4A45] transition hover:bg-black/5 hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:bg-white/10 dark:hover:text-[#C6F432]"
            >
              {dict.nav.creators}
            </Link>
          </div>

          <a
            href="https://bwebtamdi.tamadee.online/seller"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 px-2 text-xs font-extrabold text-[#111111] hover:underline dark:text-[#C6F432]"
          >
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dict.nav.sellerPortal}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
