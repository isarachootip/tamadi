import type { JSX, ReactNode } from "react";
import { getServerI18n } from "../../data/i18n-server";
import { listCategories } from "../../data/repositories/catalog-repo";
import { getServerCart } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";
import type { ProductCategory } from "../../domain/types";
import { DesktopFooter } from "../desktop/DesktopFooter";
import { DesktopNavbar } from "../desktop/DesktopNavbar";

export interface DesktopAppShellProps {
  readonly children: ReactNode;
  readonly categories?: readonly ProductCategory[];
  readonly cartCount?: number;
  readonly searchQuery?: string;
  readonly forceDark?: boolean;
  readonly narrowContent?: boolean;
}

export async function DesktopAppShell({
  children,
  categories,
  cartCount,
  searchQuery,
  forceDark = false,
  narrowContent = false,
}: DesktopAppShellProps): Promise<JSX.Element> {
  const [{ dict }, resolvedCategories, resolvedCount] = await Promise.all([
    getServerI18n(),
    categories ? Promise.resolve(categories) : listCategories().catch(() => []),
    cartCount !== undefined
      ? Promise.resolve(cartCount)
      : getServerCart().then((c) => computeCartSummary(c).totalQuantity),
  ]);

  return (
    <div
      className={`flex min-h-dvh w-full flex-col ${
        forceDark
          ? "bg-[#111111] text-white"
          : "bg-white text-[#111111] dark:bg-[#111111] dark:text-white"
      }`}
    >
      <DesktopNavbar
        categories={resolvedCategories}
        cartCount={resolvedCount}
        searchQuery={searchQuery}
        dict={dict}
      />

      <main
        className={`mx-auto w-full flex-1 px-6 pt-8 lg:px-10 ${
          narrowContent ? "max-w-4xl" : "max-w-[1360px]"
        }`}
      >
        {children}
      </main>

      <DesktopFooter categories={resolvedCategories} dict={dict} />
    </div>
  );
}
