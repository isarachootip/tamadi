"use client";

import { Grid2X2, Heart, Home, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

export function BottomNavBar(): JSX.Element {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isCategories =
    pathname.startsWith("/categories") || pathname.startsWith("/products");
  const isWishlist = pathname.startsWith("/wishlist");
  const isAccount = pathname.startsWith("/account");
  const isAi = pathname.startsWith("/ai");

  return (
    <nav
      aria-label="เมนูหลักด้านล่าง"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#E2E2DC] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95"
    >
      <div className="grid h-16 grid-cols-5 items-center">
        <NavItem
          href="/"
          label="หน้าแรก"
          active={isHome}
          Icon={Home}
        />
        <NavItem
          href="/categories"
          label="หมวดหมู่"
          active={isCategories}
          Icon={Grid2X2}
        />
        <div className="flex items-center justify-center">
          <Link
            href="/ai"
            aria-label="ผู้ช่วย AI น้องทำมะดิ"
            aria-current={isAi ? "page" : undefined}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6F432] text-[#111111] shadow-md ring-2 ring-[#111111]/10 transition hover:scale-105 dark:ring-white/15"
          >
            <Sparkles className="h-5 w-5 stroke-[2.4]" aria-hidden="true" />
          </Link>
        </div>
        <NavItem
          href="/wishlist"
          label="ถูกใจ"
          active={isWishlist}
          Icon={Heart}
        />
        <NavItem
          href="/account"
          label="ฉัน"
          active={isAccount}
          Icon={User}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  active,
  Icon,
}: {
  readonly href: string;
  readonly label: string;
  readonly active: boolean;
  readonly Icon: typeof Home;
}): JSX.Element {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${
        active
          ? "text-[#111111] dark:text-[#C6F432]"
          : "text-[#4A4A45] hover:text-[#111111] dark:text-[#D4D4CE] dark:hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-[2]"}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
