import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { JSX, ReactNode } from "react";

export interface TopBackHeaderProps {
  readonly title: string;
  readonly backHref?: string;
  readonly rightSlot?: ReactNode;
}

export function TopBackHeader({
  title,
  backHref = "/",
  rightSlot,
}: TopBackHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-[#E2E2DC] bg-white/95 px-4 backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
      <Link
        href={backHref}
        aria-label="ย้อนกลับ"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F1F1EE] text-[#111111] transition hover:bg-[#E2E2DC] dark:bg-[#1C1C1A] dark:text-white"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </Link>
      <h1 className="truncate text-base font-extrabold tracking-tight">
        {title}
      </h1>
      <div className="flex min-w-[44px] items-center justify-end">
        {rightSlot}
      </div>
    </header>
  );
}
