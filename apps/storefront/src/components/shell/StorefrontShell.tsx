import type { JSX, ReactNode } from "react";
import { getStorefrontSurface } from "../../data/surface";
import type { StorefrontSurface } from "../../domain/surface";
import type { ProductCategory } from "../../domain/types";
import { DesktopAppShell } from "./DesktopAppShell";
import { MobileAppShell } from "./MobileAppShell";

export interface StorefrontShellProps {
  readonly surface?: StorefrontSurface;
  readonly mobileContent: ReactNode;
  readonly desktopContent?: ReactNode;
  readonly showBottomNav?: boolean;
  readonly forceDark?: boolean;
  readonly narrowDesktop?: boolean;
  readonly categories?: readonly ProductCategory[];
  readonly cartCount?: number;
  readonly searchQuery?: string;
}

export async function StorefrontShell({
  surface,
  mobileContent,
  desktopContent,
  showBottomNav = true,
  forceDark = false,
  narrowDesktop = false,
  categories,
  cartCount,
  searchQuery,
}: StorefrontShellProps): Promise<JSX.Element> {
  const activeSurface = surface ?? (await getStorefrontSurface());

  if (activeSurface === "desktop") {
    return (
      <DesktopAppShell
        categories={categories}
        cartCount={cartCount}
        searchQuery={searchQuery}
        forceDark={forceDark}
        narrowContent={narrowDesktop}
      >
        {desktopContent ?? mobileContent}
      </DesktopAppShell>
    );
  }

  return (
    <MobileAppShell showBottomNav={showBottomNav} forceDark={forceDark}>
      {mobileContent}
    </MobileAppShell>
  );
}
