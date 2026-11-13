import { TamadeeLogo } from "@tamadee/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { CartIconLink } from "../shared/CartIconLink";

export interface HomeHeaderProps {
  readonly cartCount: number;
}

export function HomeHeader({ cartCount }: HomeHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E2DC] bg-white/95 px-4 pt-3 pb-3 backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="หน้าแรก Tamadee"
          className="inline-flex min-h-[44px] items-center"
        >
          <span className="block dark:hidden">
            <TamadeeLogo variant="light" width={132} height={38} />
          </span>
          <span className="hidden dark:block">
            <TamadeeLogo variant="dark" width={132} height={38} />
          </span>
        </Link>
        <CartIconLink count={cartCount} />
      </div>

      <form action="/products" method="get" className="mt-2.5 flex gap-2">
        <label htmlFor="home-search-input" className="sr-only">
          ค้นหาสินค้างานคราฟต์และแฟชั่นไทย
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4A4A45] dark:text-[#D4D4CE]"
            aria-hidden="true"
          />
          <input
            id="home-search-input"
            name="q"
            type="search"
            placeholder="ค้นหาเสื้อลินิน รองเท้าหนัง งานเซรามิก..."
            className="min-h-[44px] w-full rounded-2xl border border-transparent bg-[#F1F1EE] pr-3 pl-10 text-sm font-medium text-[#111111] placeholder:text-[#4A4A45] focus:border-[#111111] focus:outline-none dark:bg-[#1C1C1A] dark:text-white dark:placeholder:text-[#D4D4CE] dark:focus:border-[#C6F432]"
          />
        </div>
        <button
          type="submit"
          className="min-h-[44px] shrink-0 rounded-2xl bg-[#111111] px-4 text-xs font-extrabold text-[#C6F432] transition hover:opacity-90 dark:bg-[#C6F432] dark:text-[#111111]"
        >
          ค้นหา
        </button>
      </form>
    </header>
  );
}
