import { TamadeeLogo } from "@tamadee/ui";
import {
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
import { DesktopThemeButton } from "./DesktopThemeButton";

export interface DesktopNavbarProps {
  readonly categories: readonly ProductCategory[];
  readonly cartCount: number;
  readonly searchQuery?: string;
}

export function DesktopNavbar({
  categories,
  cartCount,
  searchQuery,
}: DesktopNavbarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E2DC] bg-white/95 backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-6 py-3.5 lg:px-10">
        <Link
          href="/"
          aria-label="หน้าแรก Tamadee"
          className="inline-flex min-h-[44px] shrink-0 items-center"
        >
          <span className="block dark:hidden">
            <TamadeeLogo variant="light" width={152} height={42} />
          </span>
          <span className="hidden dark:block">
            <TamadeeLogo variant="dark" width={152} height={42} />
          </span>
        </Link>

        <form
          action="/products"
          method="get"
          className="flex max-w-2xl flex-1 items-center gap-2"
        >
          <label htmlFor="desktop-search-input" className="sr-only">
            ค้นหาสินค้าแฟชั่นและงานคราฟต์ไทย
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
              placeholder="ค้นหาเสื้อลินิน รองเท้าหนัง กระเป๋าผ้า งานเซรามิกทำมือ..."
              className="min-h-[46px] w-full rounded-full border border-[#E2E2DC] bg-[#F1F1EE] pr-4 pl-11 text-sm font-medium text-[#111111] placeholder:text-[#4A4A45] focus:border-[#111111] focus:bg-white focus:outline-none dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:placeholder:text-[#D4D4CE] dark:focus:border-[#C6F432]"
            />
          </div>
          <button
            type="submit"
            className="min-h-[46px] shrink-0 rounded-full bg-[#111111] px-6 text-xs font-extrabold text-[#C6F432] transition hover:opacity-90 dark:bg-[#C6F432] dark:text-[#111111]"
          >
            ค้นหา
          </button>
        </form>

        <nav
          aria-label="เมนูหลักผู้ใช้งาน"
          className="flex shrink-0 items-center gap-2.5"
        >
          <Link
            href="/ai"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#C6F432] px-4 text-xs font-extrabold text-[#111111] transition hover:brightness-95"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>ถามน้องทำมะดิ AI</span>
          </Link>

          <DesktopThemeButton />

          <Link
            href="/wishlist"
            aria-label="รายการถูกใจ"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:hover:border-[#C6F432]"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/account"
            aria-label="บัญชีของฉัน"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E2E2DC] bg-[#F1F1EE] px-4 text-xs font-extrabold text-[#111111] transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white dark:hover:border-[#C6F432]"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">บัญชีสมาชิก</span>
          </Link>

          <Link
            href="/cart"
            aria-label={`ตะกร้าสินค้า ${cartCount} ชิ้น`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#111111] px-4 text-xs font-extrabold text-white transition hover:opacity-90 dark:bg-white dark:text-[#111111]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>ตะกร้า</span>
            <span className="font-display inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#C6F432] px-1.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
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
              className="inline-flex min-h-[44px] items-center rounded-full px-3.5 text-xs font-extrabold text-[#111111] transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
            >
              สินค้าทั้งหมด
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="inline-flex min-h-[44px] items-center rounded-full px-3.5 text-xs font-bold text-[#4A4A45] transition hover:bg-black/5 hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:bg-white/10 dark:hover:text-[#C6F432]"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/categories"
              className="inline-flex min-h-[44px] items-center rounded-full px-3.5 text-xs font-bold text-[#4A4A45] transition hover:bg-black/5 hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:bg-white/10 dark:hover:text-[#C6F432]"
            >
              ร้านค้าผู้สร้างสรรค์
            </Link>
          </div>

          <a
            href="https://bwebtamdi.tamadee.online/seller"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 px-2 text-xs font-extrabold text-[#111111] hover:underline dark:text-[#C6F432]"
          >
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            <span>เปิดร้านขายของทำมาดี (Seller Portal)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
