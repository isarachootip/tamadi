import type { JSX, ReactNode } from "react";
import { BottomNavBar } from "./BottomNavBar";

export interface MobileAppShellProps {
  readonly children: ReactNode;
  readonly showBottomNav?: boolean;
  readonly forceDark?: boolean;
}

export function MobileAppShell({
  children,
  showBottomNav = true,
  forceDark = false,
}: MobileAppShellProps): JSX.Element {
  return (
    <div className="min-h-dvh w-full bg-[#E8E8E3] dark:bg-[#090908]">
      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col shadow-xl ${
          forceDark
            ? "bg-[#111111] text-white"
            : "bg-white text-[#111111] dark:bg-[#111111] dark:text-white"
        }`}
      >
        <main
          className={`flex-1 ${showBottomNav ? "pb-24" : "pb-8"}`}
        >
          {children}
        </main>
        {showBottomNav ? <BottomNavBar /> : null}
      </div>
    </div>
  );
}
