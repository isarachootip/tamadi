import { NongTammadiMascot, TamadeeLogo } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import type { ProductCategory } from "../../domain/types";
import type { UiDictionary } from "../../i18n";

export interface DesktopFooterProps {
  readonly categories: readonly ProductCategory[];
  readonly dict: UiDictionary;
}

export function DesktopFooter({
  categories,
  dict,
}: DesktopFooterProps): JSX.Element {
  return (
    <footer className="mt-16 border-t border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] dark:border-[#2E2E2B] dark:bg-[#161614] dark:text-white">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4 lg:px-10">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <NongTammadiMascot size={48} />
            <div>
              <span className="block dark:hidden">
                <TamadeeLogo variant="light" width={140} height={38} />
              </span>
              <span className="hidden dark:block">
                <TamadeeLogo variant="dark" width={140} height={38} />
              </span>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#4A4A45] dark:text-[#D4D4CE]">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-xs font-extrabold tracking-wider uppercase">
            {dict.footer.categoriesHeading}
          </h2>
          <ul className="space-y-1.5 text-sm font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
            <li>
              <Link href="/products" className="hover:underline">
                {dict.nav.allProducts}
              </Link>
            </li>
            {categories.slice(0, 5).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="hover:underline"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-xs font-extrabold tracking-wider uppercase">
            {dict.footer.linksHeading}
          </h2>
          <ul className="space-y-1.5 text-sm font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
            <li>
              <Link href="/categories" className="hover:underline">
                {dict.nav.creators}
              </Link>
            </li>
            <li>
              <Link href="/ai" className="hover:underline">
                {dict.nav.askAi}
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:underline">
                {dict.nav.account}
              </Link>
            </li>
            <li>
              <a
                href="https://bwebtamdi.tamadee.online/seller"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#111111] hover:underline dark:text-[#C6F432]"
              >
                {dict.footer.becomeSeller}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E2E2DC] py-4 text-center text-xs font-medium text-[#4A4A45] dark:border-[#2E2E2B] dark:text-[#9E9E96]">
        © 2026 Tamadee Marketplace (webtamdi.tamadee.online • tamdi.tamadee.online • m.tamadee.online)
      </div>
    </footer>
  );
}
